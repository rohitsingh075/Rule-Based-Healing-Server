// models/Notice.js

import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now, // Defaults to current date
  },
  noticeUpload: {
    type: String, // URL to PDF/image or any file
  },
  issuedBy: {
    type: String,
    default: "Admin",
  },
  important: {
    type: Boolean,
    default: false,
  },
  tags: {
    type: [String], // e.g. ['exam', 'academic']
    default: [],
  },

});

export const Notice = mongoose.model("Notice", noticeSchema);
