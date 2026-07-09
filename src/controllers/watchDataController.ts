import { Request, Response } from "express";
import { WatchData } from "../models/WatchData";
import { IUser, User } from "../models/User";
import { RecordedAudio } from "../models/RecordedAudio";
import { UserAlert } from "../models/UserAlert";
import { AllowedZone } from "../models/AllowedZone";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { PassThrough } from "stream";

ffmpeg.setFfmpegPath(ffmpegPath as string);

interface IsentimentResponse {
  emotion: string | null;
  confidence: number | null;
  safety: string | null;
  safetyConfidence: number | null;
}

const systemMessage = {
  role: "system",
  content:
    'You are a safety classifier.\nYour job is to combine:\n- smartwatch metrics\n- speech transcript\n- sentiment analysis\n- danger classifier output\nIgnore null values\n\nReturn ONLY valid JSON {label: string, confidence: number, reason: string}\nRules:\n- Label "danger" if the evidence strongly suggests the user is in danger.\n- Label "safe" otherwise.\n- Consider all evidence instead of relying on a single signal.',
};

// Function to get allowed zones for a specific watch serial number
async function getWatchZones(
  serialNumber: string,
): Promise<{ latitude: number; longitude: number; radius: number }[]> {
  const allowedZones = await AllowedZone.find({ serialNumber });
  return allowedZones.map((zone) => ({
    latitude: zone.centerLat,
    longitude: zone.centerLng,
    radius: zone.radiusMeters,
  }));
}

// Function to check if a point is within a given radius of a center point
function isWithinRadius(
  centerLat: number,
  centerLon: number,
  radiusM: number,
  pointLat: number,
  pointLon: number,
): boolean {
  const R = 6371000; // Earth's radius in meters (mean radius)

  const toRad = (deg: number): number => (deg * Math.PI) / 180;

  const lat1 = toRad(centerLat);
  const lon1 = toRad(centerLon);
  const lat2 = toRad(pointLat);
  const lon2 = toRad(pointLon);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.asin(Math.sqrt(a));
  const distance = R * c;

  return distance <= radiusM;
}

async function createNotificationsForWatchAlert(params: {
  serialNumber: string;
  alertType: "zone" | "danger";
  watchDataId: string;
  recordedAudioId?: string;
}): Promise<void> {
  const linkedUsers = await User.find({
    serialNumbers: params.serialNumber,
  }).select("_id");

  if (linkedUsers.length === 0) {
    return;
  }

  await UserAlert.insertMany(
    linkedUsers.map((user) => ({
      recipientUserId: user._id,
      serialNumber: params.serialNumber,
      alertType: params.alertType,
      watchDataId: params.watchDataId,
      ...(params.recordedAudioId
        ? { recordedAudioId: params.recordedAudioId }
        : {}),
    })),
  );
}

// Recorded audio analysis function, runs after the watch data is saved to the database.
// It converts the audio to WAV format, sends it to two different APIs for sentiment and safety analysis,
// and updates the RecordedAudio document with the results. Runs after the response is sent to the client
// to avoid blocking the request. If the analysis indicates a negative sentiment or danger, an alert can be sent to the user.
async function analyzeRecordedAudio(
  audioBuffer: Buffer,
  recordedAudioId: string,
  serialNumber: string,
  watchDataId: string,
  watchData?: {
    heartRate?: number;
    stepCount?: number;
  },
): Promise<void> {
  let sentimentResponse: IsentimentResponse = {
    emotion: null,
    confidence: null,
    safety: null,
    safetyConfidence: null,
  };

  try {
    const wavBuffer = await convertToWav(audioBuffer);
    if (!wavBuffer) {
      return;
    }

    const formData = new FormData();
    formData.append(
      "file",
      new Blob([new Uint8Array(wavBuffer)], {
        type: "audio/wav",
      }),
      "audio.wav",
    );

    try {
      const response = await fetch(
        "https://abedir-emotion-detector-api.hf.space/predict",
        {
          method: "POST",
          body: formData,
        },
      );
      sentimentResponse = await response.json();
    } catch (error) {
      console.log("Error Sentiment Analysis", error);
    }

    const formDataSafety = new FormData();
    formDataSafety.append(
      "audio",
      new Blob([new Uint8Array(wavBuffer)], {
        type: "audio/wav",
      }),
      "audio.wav",
    );
    let transcript: string | null = null;
    try {
      const safetyResponse = await fetch(
        "https://mennatullahhany-bertx.hf.space/predict",
        {
          method: "POST",
          body: formDataSafety,
        },
      );
      const safetyData = await safetyResponse.json();
      if (safetyData && safetyData.text && safetyData.text.length > 0) {
        transcript = safetyData.text;
      }
      sentimentResponse.safety = safetyData.result;
      sentimentResponse.safetyConfidence = safetyData.confidence;
    } catch (error) {
      console.log("Error Safety Analysis", error);
    }

    await RecordedAudio.findByIdAndUpdate(recordedAudioId, {
      emotion: sentimentResponse.emotion,
      confidence: sentimentResponse.confidence,
      safety: sentimentResponse.safety,
      safetyConfidence: sentimentResponse.safetyConfidence,
    });

    if (watchData) {
      const data = {
        heartRate: watchData.heartRate ?? null,
        stepCount: watchData.stepCount ?? null,
        emotion: sentimentResponse.emotion ?? null,
        emotionConfidence: sentimentResponse.confidence ?? null,
        safety: sentimentResponse.safety ?? null,
        safetyConfidence: sentimentResponse.safetyConfidence ?? null,
        transcript: transcript ?? null,
      };
      try {
        const response = await fetch(
          "https://inference.dahl.global/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.DAHL_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "MiniMaxAI/MiniMax-M2.7",
              messages: [
                systemMessage,
                {
                  role: "user",
                  content: JSON.stringify(data),
                },
              ],
            }),
          },
        );
        const dahlResponse = await response.json();
        const content = dahlResponse?.choices?.[0]?.message?.content ?? "";
        const jsonMatch = content.match(/\{[\s\S]*\}$/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        const dahlJSON = JSON.parse(jsonMatch[0]);
        let dahlLabel: string | null = dahlJSON?.label ?? null;

        if (dahlLabel === "danger") {
          await createNotificationsForWatchAlert({
            serialNumber,
            alertType: "danger",
            watchDataId: watchDataId,
            recordedAudioId: recordedAudioId ?? undefined,
          });
        }
      } catch (error) {
        console.log("Error DAHL API", error);
        if (
          sentimentResponse.emotion === "Angry/Fearful" ||
          sentimentResponse.emotion === "Sad/Cry" ||
          sentimentResponse.safety === "Danger"
        ) {
          await createNotificationsForWatchAlert({
            serialNumber,
            alertType: "danger",
            watchDataId: watchDataId,
            recordedAudioId: recordedAudioId ?? undefined,
          });
        }
      }
    }
  } catch (error) {
    console.log("Error processing recorded audio", error);
  }
}

function convertToWav(buffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const input = new PassThrough();
    input.end(buffer);

    const chunks: Buffer[] = [];
    ffmpeg(input)
      .toFormat("wav")
      .audioChannels(1)
      .audioFrequency(16000)
      .on("error", reject)
      .on("end", () => resolve(Buffer.concat(chunks)))
      .pipe()
      .on("data", (chunk) => chunks.push(chunk));
  });
}

// POST /api/watch-data
export const uploadWatchData = async (req: Request, res: Response) => {
  try {
    const {
      serialNumber,
      heartRate,
      stepCount,
      longitude,
      latitude,
      batteryLevel,
    } = req.body;
    const recordedAudio = req.file ? req.file.buffer : null;

    let watchDataId: string | null = null;
    const watchData = await WatchData.create({
      serialNumber,
      heartRate: heartRate ? Number(heartRate) : null,
      stepCount: stepCount ? Number(stepCount) : null,
      longitude: longitude ? Number(longitude) : null,
      latitude: latitude ? Number(latitude) : null,
      batteryLevel: batteryLevel ? Number(batteryLevel) : null,
    });
    watchDataId = watchData.id;

    if (latitude && longitude) {
      const watchZones = await getWatchZones(serialNumber);
      const isInsideAnyAllowedZone = watchZones.some((zone) =>
        isWithinRadius(
          zone.latitude,
          zone.longitude,
          zone.radius,
          Number(latitude),
          Number(longitude),
        ),
      );

      if (watchZones.length > 0 && !isInsideAnyAllowedZone) {
        await createNotificationsForWatchAlert({
          serialNumber,
          alertType: "zone",
          watchDataId: watchData.id,
        });
      }
    }

    let recordedAudioId: string | null = null;
    if (recordedAudio) {
      const recordedAudioDoc = await RecordedAudio.create({
        serialNumber,
        recordedAudio: recordedAudio,
        emotion: null,
        confidence: null,
        safety: null,
        safetyConfidence: null,
      });
      recordedAudioId = recordedAudioDoc.id;
    }

    res.status(201).json({
      message: "Watch data saved successfully",
      id: watchData._id,
    });

    if (recordedAudio && recordedAudioId && watchDataId) {
      void analyzeRecordedAudio(
        recordedAudio,
        recordedAudioId,
        serialNumber,
        watchDataId,
        watchData ? { heartRate, stepCount } : undefined,
      );
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving watch data" });
  }
};

// GET /api/watch-data/:serialNumber
export const getWatchData = async (req: Request, res: Response) => {
  try {
    const { serialNumber } = req.params;
    const userId = (req as any).user.id;

    if (!serialNumber) {
      return res.status(400).json({ message: "Serial number is required" });
    }

    const user: IUser | null = await User.findById(userId);
    if (
      !user ||
      !user.serialNumbers ||
      !user.serialNumbers.includes(serialNumber)
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden - user does not own this watch" });
    }

    const lastDataInstance = await WatchData.findOne({ serialNumber }).sort({
      createdAt: -1,
    }); // Return latest data entry for the watch
    res.json(lastDataInstance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving watch data" });
  }
};
