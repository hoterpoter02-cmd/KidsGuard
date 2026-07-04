import { Request, Response } from "express";
import { WatchData } from "../models/WatchData";
import { IUser, User } from "../models/User";
import { RecordedAudio } from "../models/RecordedAudio";

interface IsentimentResponse {
  emotion: string | null;
  confidence: number | null;
  safety: string | null;
  safetyConfidence: number | null;
}

const PREDICTION_TIMEOUT_MS = 10000;

const bufferToFormData = (
  fieldName: string,
  buffer: Buffer,
  mimetype: string,
  originalname: string,
) => {
  const formData = new FormData();
  formData.append(
    fieldName,
    new Blob([new Uint8Array(buffer)], {
      type: mimetype,
    }),
    originalname,
  );
  return formData;
};

const fetchJsonWithTimeout = async (url: string, body: FormData) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PREDICTION_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      body,
      signal: controller.signal,
    });

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
};

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
      const fileBuffer = req.file.buffer;
      const [emotionResult, safetyResult] = await Promise.allSettled([
        fetchJsonWithTimeout(
          "https://abedir-emotion-detector-api.hf.space/predict",
          bufferToFormData(
            "file",
            fileBuffer,
            req.file.mimetype,
            req.file.originalname,
          ),
        ),
        fetchJsonWithTimeout(
          "https://mennatullahhany-bertx.hf.space/predict",
          bufferToFormData(
            "audio",
            fileBuffer,
            req.file.mimetype,
            req.file.originalname,
          ),
        ),
      ]);

      if (emotionResult.status === "fulfilled") {
        sentimentResponse.emotion = emotionResult.value.emotion;
        sentimentResponse.confidence = emotionResult.value.confidence;
      } else {
        console.log("Error Sentiment Analysis", emotionResult.reason);
      }

      if (safetyResult.status === "fulfilled") {
        sentimentResponse.safety = safetyResult.value.result;
        sentimentResponse.safetyConfidence = safetyResult.value.confidence;
      } else {
        console.log("Error Safety Analysis", safetyResult.reason);
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
