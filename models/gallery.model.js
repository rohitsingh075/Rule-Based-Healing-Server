import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  photos: [
    {
      type: String, // filenames
    }
  ],
 
  
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export const Gallery = mongoose.model("Gallery", gallerySchema);
