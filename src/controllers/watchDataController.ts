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
      // Multer changes the file buffer to Uint8Array, convert it back to Blob
      let formData = new FormData();
      formData.append(
        "file",
        new Blob([new Uint8Array(req.file.buffer)], {
          type: req.file.mimetype,
        }),
        req.file.originalname,
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
      let formDataSafety = new FormData();
      formDataSafety.append(
        "audio",
        new Blob([new Uint8Array(req.file.buffer)], {
          type: req.file.mimetype,
        }),
        req.file.originalname,
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
        sentimentResponse.safety = safetyData.safety;
        sentimentResponse.safetyConfidence = safetyData.confidence;
      } catch (error) {
        console.log("Error Safety Analysis", error);
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
