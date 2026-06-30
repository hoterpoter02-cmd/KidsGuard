import { Schema, model, Document } from "mongoose";

export interface IRecordedAudio extends Document {
  serialNumber: string;
  recordedAudio: Buffer;
  emotion: string | null;
  safety: string | null;
  confidence: number | null;
  safetyConfidence: number | null;
  createdAt: Date;
  updatedAt: Date;
}
const RecordedAudioSchema = new Schema<IRecordedAudio>(
  {
    serialNumber: { type: String, required: true, index: true },
    recordedAudio: { type: Buffer, required: true },
    emotion: { type: String, required: false },
    confidence: { type: Number, required: false },
    safety: { type: String, required: false },
    safetyConfidence: { type: Number, required: false },
  },
  { timestamps: true },
);

// Keep only the last 10 instances of recorded audio for each serial number
RecordedAudioSchema.post("save", async function () {
  const serialNumber = this.serialNumber;
  const count = await RecordedAudio.countDocuments({ serialNumber });

  if (count > 10) {
    const oldestDoc = await RecordedAudio.findOne({ serialNumber }).sort({
      createdAt: 1,
    });
    if (oldestDoc) {
      await RecordedAudio.deleteOne({ _id: oldestDoc._id });
    }
  }
});

export const RecordedAudio = model<IRecordedAudio>(
  "RecordedAudio",
  RecordedAudioSchema,
);
