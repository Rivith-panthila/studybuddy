import mongoose, { Document, Schema } from "mongoose";

export interface ICoursework extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  deadline?: Date;
  analysis: string;
  originalFileName: string;
}

const courseworkSchema = new Schema<ICoursework>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    deadline: {
      type: Date,
    },
    analysis: {
      type: String,
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Coursework = mongoose.model<ICoursework>(
  "Coursework",
  courseworkSchema
);

export default Coursework;