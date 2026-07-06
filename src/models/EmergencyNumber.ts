import { Schema, model, Document } from "mongoose";

export interface IEmergencyNumber extends Document {
  serialNumber: string;
  emergencyNumber: string;
  createdAt: Date;
  updatedAt: Date;
}
const EmergencyNumberSchema = new Schema<IEmergencyNumber>(
  {
    serialNumber: { type: String, required: true, index: true },
    emergencyNumber: { type: String, required: true },
  },
  { timestamps: true },
);

export const EmergencyNumber = model<IEmergencyNumber>(
  "EmergencyNumber",
  EmergencyNumberSchema,
);
