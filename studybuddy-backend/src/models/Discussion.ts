
import mongoose, { Document, Schema } from "mongoose";

export interface IDiscussion extends Document {
  userId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  attachment?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
  };
}

const discussionSchema = new Schema<IDiscussion>(
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
    content: {
      type: String,
      required: true,
      trim: true,
    },
    attachment: {
      fileName: String,
      fileUrl: String,
      fileType: String,
    },
  },
  { timestamps: true }
);

const Discussion = mongoose.model<IDiscussion>(
  "Discussion",
  discussionSchema
);

export default Discussion;
