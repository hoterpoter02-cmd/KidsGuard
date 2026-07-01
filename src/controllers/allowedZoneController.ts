import { Response, Request } from "express";
import { AllowedZone } from "../models/AllowedZone";
import { User } from "../models/User";

export const addZone = async (req: Request, res: Response) => {
  const { serialNumber, zoneName, centerLat, centerLng, radiusMeters } =
    req.body;
  const userId = (req as any).user.id;

  if (!serialNumber) {
    return res.status(400).json({ message: "Serial number is required" });
  }

  if (!zoneName || !centerLat || !centerLng || !radiusMeters) {
    return res
      .status(400)
      .json({ message: "All zone parameters are required" });
  }
  try {
    const user = await User.findById(userId);
    if (
      !user ||
      user.serialNumbers == null ||
      !user.serialNumbers.includes(serialNumber)
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden - user does not own this watch" });
    }
    const newZone = await AllowedZone.create({
      serialNumber,
      zoneName,
      centerLat,
      centerLng,
      radiusMeters,
    });
    return res.status(201).json(newZone);
  } catch (error) {
    return res.status(500).json({ message: "Failed to add zone", error });
  }
};

export const listZones = async (req: Request, res: Response) => {
  const { serialNumber } = req.params;
  const userId = (req as any).user.id;

  if (!serialNumber) {
    return res.status(400).json({ message: "Serial number is required" });
  }
  try {
    const user = await User.findById(userId);
    if (
      !user ||
      user.serialNumbers == null ||
      !user.serialNumbers.includes(serialNumber)
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden - user does not own this watch" });
    }
    const zones = await AllowedZone.find({ serialNumber });
    return res.status(200).json(zones);
  } catch (error) {
    return res.status(500).json({ message: "Failed to list zones", error });
  }
};

export const removeZone = async (req: Request, res: Response) => {
  const { zoneId } = req.params;
  if (!zoneId) {
    return res.status(400).json({ message: "Zone ID is required" });
  }
  try {
    await AllowedZone.findByIdAndDelete(zoneId);
    return res.status(204).json({ message: "Zone removed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to remove zone", error });
  }
};
