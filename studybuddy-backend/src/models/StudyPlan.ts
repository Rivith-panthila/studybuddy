import mongoose, { Document, Schema } from "mongoose";

export interface IStudyPlan extends Document {
  userId: mongoose.Types.ObjectId;
  courseworkId: mongoose.Types.ObjectId;
 dailySchedule: {
  date: Date;
  tasks: {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    duration: number;
    status: "Pending" | "Completed";
  }[];
}[];
}

const studyPlanSchema = new Schema<IStudyPlan>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseworkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coursework",
      required: true,
    },
    dailySchedule: [
      {
        date: {
          type: Date,
          required: true,
        },
        tasks: [
          {
            title: {
              type: String,
              required: true,
            },
            description: {
              type: String,
              required: true,
            },
            duration: {
              type: Number,
              required: true,
              min: 1,
            },
            status: {
              type: String,
              enum: ["Pending", "Completed"],
              default: "Pending",
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const StudyPlan = mongoose.model<IStudyPlan>(
  "StudyPlan",
  studyPlanSchema
);

export default StudyPlan;