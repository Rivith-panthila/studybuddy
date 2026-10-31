import mongoose, { Document, Schema } from "mongoose";

export interface IAssignment extends Document {
  userId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  title: string;
  dueDate: Date;
  status: "Pending" | "Completed";
}

const assignmentSchema = new Schema<IAssignment>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Assignment = mongoose.model<IAssignment>(
  "Assignment",
  assignmentSchema
);

export default Assignment;