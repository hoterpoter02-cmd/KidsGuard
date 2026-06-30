import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name?: string;
  email: string;
  role?: "user" | "admin";
  password?: string;
  googleId?: string;
  photoUrl?: string;
  serialNumbers?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    photoUrl: { type: String },
    serialNumbers: [{ type: String }],
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true },
);

export const User = model<IUser>("User", userSchema);
