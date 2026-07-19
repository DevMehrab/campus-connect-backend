import mongoose, { Schema, Document } from "mongoose";

export interface ICalendarEvent extends Document {
  title: string;
  category: "academics" | "govt_holiday" | "optional_holiday" | "seminar_workshop" | "sports";
  startDate: string;
  endDate: string;
  durationDays: number;
  department: string | null;
  semester: number | null;
  notes?: string;
}

const CalendarEventSchema = new Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["academics", "govt_holiday", "optional_holiday", "seminar_workshop", "sports"]
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    durationDays: { type: Number, required: true },
    department: { type: String, default: null },
    semester: { type: Number, default: null },
    notes: { type: String }
  },
  { timestamps: true }
);

export const CalendarEvent = mongoose.model("CalendarEvent", CalendarEventSchema);
