import { Request, Response } from "express";
import { IEmergencyNumber, EmergencyNumber } from "../models/EmergencyNumber";
import { IUser, User } from "../models/User";

export async function getEmergencyNumber(req: Request, res: Response) {
  const serialNumber = req.params.serialNumber;
  if (!serialNumber) {
    return res.status(400).json({ message: "Serial number is required" });
  }
  const emergencyNumber = await EmergencyNumber.findOne({ serialNumber });
  if (!emergencyNumber) {
    return res.status(404).json({ message: "Emergency number not found" });
  }
  res.json({
    serialNumber: emergencyNumber.serialNumber,
    emergencyNumber: emergencyNumber.emergencyNumber,
  });
}

export async function addEmergencyNumber(req: Request, res: Response) {
  const { emergencyNumber } = req.body;
  const serialNumber = req.params.serialNumber;
  if (!serialNumber || !emergencyNumber) {
    return res
      .status(400)
      .json({ message: "Serial number and emergency number are required" });
  }
  const userId = (req as any).user.id;
  const user = await User.findById(userId);
  if (
    !user ||
    !user.serialNumbers ||
    !user.serialNumbers.includes(serialNumber)
  ) {
    return res
      .status(403)
      .json({ message: "User does not have access to this serial number" });
  }

  const existingEmergencyNumber = await EmergencyNumber.findOne({
    serialNumber,
  });
  if (existingEmergencyNumber) {
    existingEmergencyNumber.emergencyNumber = emergencyNumber;
    await existingEmergencyNumber.save();
    return res.json({
      serialNumber: existingEmergencyNumber.serialNumber,
      emergencyNumber: existingEmergencyNumber.emergencyNumber,
    });
  } else {
    const newEmergencyNumber: IEmergencyNumber = new EmergencyNumber({
      serialNumber,
      emergencyNumber,
    });
    await newEmergencyNumber.save();
    return res.status(201).json({
      serialNumber: newEmergencyNumber.serialNumber,
      emergencyNumber: newEmergencyNumber.emergencyNumber,
    });
  }
}
