
import mongoose, { Document, Schema } from "mongoose";

export interface ISubject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
}

const subjectSchema = new Schema<ISubject>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Subject = mongoose.model<ISubject>(
  "Subject",
  subjectSchema
);

export default Subject;
