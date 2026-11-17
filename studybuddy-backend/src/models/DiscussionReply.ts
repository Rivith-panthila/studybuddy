
import mongoose, { Document, Schema } from "mongoose";

export interface IDiscussionReply extends Document {
  discussionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
}

const discussionReplySchema = new Schema<IDiscussionReply>(
  {
    discussionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const DiscussionReply = mongoose.model<IDiscussionReply>(
  "DiscussionReply",
  discussionReplySchema
);

export default DiscussionReply;
