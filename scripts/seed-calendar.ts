import mongoose from "mongoose";
import { config } from "../src/config";
import { CalendarEvent } from "../src/modules/assistant/calendar.model";
import fs from "fs";

const seedDatabase = async () => {
  try {
    await mongoose.connect(config.db.uri as string);
    console.log("Connected to MongoDB");

    const rawData = fs.readFileSync("bup_academic_calendar_2026.json", "utf-8");
    const calendarData = JSON.parse(rawData);

    await CalendarEvent.deleteMany({});
    console.log("Cleared old calendar data");

    await CalendarEvent.insertMany(calendarData);
    console.log("Successfully seeded new calendar data!");

    process.exit();
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedDatabase();
