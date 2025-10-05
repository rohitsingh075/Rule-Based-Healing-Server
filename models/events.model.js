import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: "To be announced",
  },
  organizer: {
    type: String,
    default: "Admin",
  },
  imagePath: {
    type: String, // optional - in case you want to show banners/images
  },
},{timestamps:true});

export const Event= mongoose.model("Event", eventSchema);
