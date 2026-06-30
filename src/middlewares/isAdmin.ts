import { User } from "../models/User";
import { Request, Response, NextFunction } from "express";

export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden - Admins only" });
    }
    next();
  } catch (err) {
    return res.status(500).json({ error: err });
  }
}
