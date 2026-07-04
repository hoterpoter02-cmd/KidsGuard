import { Request, Response } from "express";
import { WatchData } from "../models/WatchData";
import { IUser, User } from "../models/User";
import { RecordedAudio } from "../models/RecordedAudio";
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
    let sentimentResponse: IsentimentResponse = {
      emotion: null,
      confidence: null,
      safety: null,
      safetyConfidence: null,
    };

    if (req.file) {
      let wavBuffer: Buffer;
      try {
        wavBuffer = await convertToWav(req.file.buffer);
      } catch (error) {
        console.error("Error converting to WAV:", error);
        return res
          .status(500)
          .json({ message: "Error converting audio to WAV format" });
      }
      if (wavBuffer) {
        let formData = new FormData();
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
          console.log("Sentiment Response", sentimentResponse);
        } catch (error) {
          console.log("Error Sentiment Analysis", error);
        }
        let formDataSafety = new FormData();
        formDataSafety.append(
          "audio",
          new Blob([new Uint8Array(wavBuffer)], {
            type: "audio/wav",
          }),
          "audio.wav",
        );
        try {
          const safetyResponse = await fetch(
            "https://mennatullahhany-bertx.hf.space/predict",
            {
              method: "POST",
              body: formDataSafety,
            },
          );
          const safetyData = await safetyResponse.json();
          console.log("Safety Data", safetyData);
          sentimentResponse.safety = safetyData.result;
          sentimentResponse.safetyConfidence = safetyData.confidence;
        } catch (error) {
          console.log("Error Safety Analysis", error);
        }
      }
    }

    const watchData = await WatchData.create({
      serialNumber,
      heartRate: heartRate ? Number(heartRate) : null,
      stepCount: stepCount ? Number(stepCount) : null,
      longitude: longitude ? Number(longitude) : null,
      latitude: latitude ? Number(latitude) : null,
      batteryLevel: batteryLevel ? Number(batteryLevel) : null,
    });

    if (recordedAudio) {
      await RecordedAudio.create({
        serialNumber,
        recordedAudio: recordedAudio,
        emotion: sentimentResponse.emotion,
        confidence: sentimentResponse.confidence,
        safety: sentimentResponse.safety,
        safetyConfidence: sentimentResponse.safetyConfidence,
      });
    }

    res.status(201).json({
      message: "Watch data saved successfully",
      id: watchData._id,
    });
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
