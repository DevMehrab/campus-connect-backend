import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "../src/config";

import { User } from "../src/modules/user/user.model";

const seedUsers = async () => {
  try {
    await mongoose.connect(config.db.uri as string);
    console.log("Connected to MongoDB");

    await User.deleteMany({});
    console.log("Cleared old user data");

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("password123", saltRounds);

    const dummyUsers = [
      {
        name: "Alice Johnson",
        username: "alice_j123",
        email: "alice@example.com",
        password: hashedPassword,
        role: "STUDENT",
        universityId: "BUP1001",
        batch: 1,
        bio: "CS student passionate about Web3 and AI.",
        isVerified: true,
        isActive: true
      },
      {
        name: "Bob Smith",
        username: "bob_smith99",
        email: "bob@example.com",
        password: hashedPassword,
        role: "STUDENT",
        universityId: "BUP1002",
        batch: 2,
        bio: "Building the next big thing.",
        isVerified: false,
        isActive: true
      },
      {
        name: "Charlie Davis",
        username: "charlie_alumni",
        email: "charlie@example.com",
        password: hashedPassword,
        role: "ALUMNI",
        universityId: "BUP0001",
        batch: 4,
        bio: "Software Engineer @ TechCorp. Happy to mentor!",
        isVerified: true,
        isActive: true
      }
    ];

    await User.insertMany(dummyUsers);
    console.log(`Successfully seeded ${dummyUsers.length} users!`);

    process.exit();
  } catch (error) {
    console.error("Error seeding user data:", error);
    process.exit(1);
  }
};

seedUsers();
