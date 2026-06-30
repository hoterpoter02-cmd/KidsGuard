import { Schema, model, Document } from "mongoose";

export interface IWatchData extends Document {
  serialNumber: string;
  heartRate: number | null;
  stepCount: number | null;
  longitude: number | null;
  latitude: number | null;
  batteryLevel: number | null;
  createdAt: Date;
  updatedAt: Date;
}
const WatchDataSchema = new Schema<IWatchData>(
  {
    serialNumber: { type: String, required: true, index: true },
    heartRate: { type: Number, required: false },
    stepCount: { type: Number, required: false },
    longitude: { type: Number, required: false },
    latitude: { type: Number, required: false },
    batteryLevel: { type: Number, required: false },
  },
  { timestamps: true },
);

// Keep only the last 10 instances of watch data for each serial number
WatchDataSchema.post("save", async function () {
  const serialNumber = this.serialNumber;
  const count = await WatchData.countDocuments({ serialNumber });

  if (count > 10) {
    const oldestDoc = await WatchData.findOne({ serialNumber }).sort({
      createdAt: 1,
    });
    if (oldestDoc) {
      await WatchData.deleteOne({ _id: oldestDoc._id });
    }
  }
});

export const WatchData = model<IWatchData>("WatchData", WatchDataSchema);
