import { Schema, model, Document, Types } from "mongoose";

export interface IUserAlert extends Document {
  recipientUserId: Types.ObjectId;
  serialNumber: string;
  alertType: "zone" | "danger";
  watchDataId: Schema.Types.ObjectId;
  recordedAudioId?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserAlertSchema = new Schema<IUserAlert>(
  {
    recipientUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    serialNumber: { type: String, required: true, index: true },
    alertType: { type: String, required: true, enum: ["zone", "danger"] },
    watchDataId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "WatchData",
    },
    recordedAudioId: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "RecordedAudio",
    },
  },
  { timestamps: true },
);

export const UserAlert = model<IUserAlert>("UserAlert", UserAlertSchema);
