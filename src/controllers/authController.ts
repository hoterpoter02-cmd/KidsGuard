import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

// Send token and refresh token in response and set refresh token as HttpOnly cookie

const JWT_SECRET = process.env.JWT_SECRET || "CHANGE_ME";
const REFRESH_COOKIE_NAME = "refreshToken";

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const generateAccessToken = (userId: string, email: string) => {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: "1h" });
};
const generateRefreshToken = (userId: string, email: string) => {
  return jwt.sign({ id: userId, email, type: "refresh" }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

const getRefreshTokenFromRequest = (req: Request) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  if (req.cookies?.[REFRESH_COOKIE_NAME]) {
    return req.cookies[REFRESH_COOKIE_NAME];
  }

  if (req.body?.refreshToken) {
    return req.body.refreshToken;
  }

  return null;
};

// /api/auth/register
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(
      password,
      Number(process.env.Hash_Salt) || 10,
    );

    const user = await User.create({ name, email, password: hashed });

    const token = generateAccessToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString(), user.email);
    const userSafe = user.toObject();
    delete (userSafe as any).password;

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

    return res.status(201).json({ token, refreshToken, user: userSafe });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateAccessToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString(), user.email);

    const userSafe = user.toObject();
    delete (userSafe as any).password;

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
    return res.status(200).json({ token, refreshToken, user: userSafe });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

export const logoutUser = async (_req: Request, res: Response) => {
  try {
    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res
      .status(200)
      .json({ message: "Logged out (client should discard token)" });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = getRefreshTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    if (!payload || payload.type !== "refresh") {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user._id.toString(), user.email);
    const newRefreshToken = generateRefreshToken(
      user._id.toString(),
      user.email,
    );

    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, refreshCookieOptions);

    return res
      .status(200)
      .json({ token: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};
