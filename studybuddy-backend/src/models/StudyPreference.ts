import mongoose, { Document, Schema } from "mongoose";

export interface IStudyPreference extends Document {
  userId: mongoose.Types.ObjectId;
  hoursPerDay: number;
  availableDays: {
    day: string;
    hours: number;
  }[];
  preferredTime: "Morning" | "Afternoon" | "Evening";
  breakDuration: number;
}

const studyPreferenceSchema = new Schema<IStudyPreference>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    hoursPerDay: {
      type: Number,
      required: true,
      min: 0.5,
      max: 16,
    },
    availableDays: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          required: true,
        },
        hours: {
          type: Number,
          required: true,
          min: 0.5,
          max: 16,
        },
      },
    ],
    preferredTime: {
      type: String,
      enum: ["Morning", "Afternoon", "Evening"],
      required: true,
    },
    breakDuration: {
      type: Number,
      default: 10,
      min: 0,
      max: 60,
    },
  },
  { timestamps: true }
);

const StudyPreference = mongoose.model<IStudyPreference>(
  "StudyPreference",
  studyPreferenceSchema
);

export default StudyPreference;