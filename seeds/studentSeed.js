import mongoose from "mongoose";
import { Student } from "../models/student.model.js"; // Adjust the path to your Student model
import fs from "fs";
import path from "path";

const seed = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb+srv://arpdevproductions:RsL263pntwVPsjnk@ncrc-website.mxex5wq.mongodb.net/NCRC-WEBSITE", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Clear previous data (optional)
    await Student.deleteMany({});
    console.log("✅ Previous student data cleared.");

    // Read data from the JSON file
    const filePath = path.resolve(process.cwd(), "students_updated.json");
    const studentsData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // Insert data into the Student collection
    await Student.insertMany(studentsData);
    console.log(`✅ ${studentsData.length} Students Seeded`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error seeding students:", error.message);
    await mongoose.disconnect();
  }
};

seed();
