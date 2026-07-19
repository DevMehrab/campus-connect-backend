import mongoose, { Schema, Document } from "mongoose";

export interface IRoutine extends Document {
  user: mongoose.Types.ObjectId;
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  subject: string;
  type: "Lecture" | "Lab" | "Seminar";
  startTime: string;
  endTime: string;
  room: string;
}

const routineSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  dayOfWeek: {
    type: String,
    required: true,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  },
  subject: { type: String, required: true },
  type: { type: String, required: true, enum: ["Lecture", "Lab", "Seminar"] },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: String
});

export const Routine = mongoose.model<IRoutine>("Routine", routineSchema);
