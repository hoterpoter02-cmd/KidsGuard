import { Schema, model, Document } from "mongoose";

export interface IAllowedZone extends Document {
  serialNumber: string;
  zoneName: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  createdAt: Date;
  updatedAt: Date;
}
const AllowedZoneSchema = new Schema<IAllowedZone>(
  {
    serialNumber: { type: String, required: true, index: true },
    zoneName: { type: String, required: true },
    centerLat: { type: Number, required: true },
    centerLng: { type: Number, required: true },
    radiusMeters: { type: Number, required: true },
  },
  { timestamps: true },
);

export const AllowedZone = model<IAllowedZone>(
  "AllowedZone",
  AllowedZoneSchema,
);
