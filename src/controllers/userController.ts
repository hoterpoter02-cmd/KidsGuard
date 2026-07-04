import { Request, Response } from "express";
import { User } from "../models/User";
import { UserAlert } from "../models/UserAlert";

export const getCurrentUserInfo = async (req: Request, res: Response) => {
  const user: any = await User.findById((req as any).user.id);
  if (!user) {
    return res.status(401).json({ message: "User Not Found" });
  }
  res
    .json({
      user: {
        email: user.email,
        name: user.name ?? "",
        photoUrl: user.photoUrl ?? "",
        serialNumbers: user.serialNumbers ?? [],
        role: user.role ?? "user",
      },
    })
    .status(200);
};

export const updateUserInformation = async (req: Request, res: Response) => {
  try {
    const { name, photoUrl } = req.body;
    if (!name && !photoUrl) {
      return res.status(400).json({ message: "No fields to update" });
    }
    const userId = (req as any).user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(photoUrl && { photoUrl }),
      },
      { new: true },
    );
    res
      .status(200)
      .json({ message: "User information updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const deleteUserAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    await User.findByIdAndDelete(userId);
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(204).json({ message: "User account deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const notifications = await UserAlert.find({ recipientUserId: userId })
      .sort({ createdAt: -1 })
      .populate("watchDataId")
      .populate("recordedAudioId");

    res.status(200).json({ notifications });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
