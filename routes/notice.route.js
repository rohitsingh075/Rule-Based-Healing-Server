import express from "express";
import {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  getNoticesByDate,  
} from "../controllers/notice.controller.js";

import { uploadNotice } from "../middlewares/uploadNotice.multer.js";


const router = express.Router();

// Route to create a new notice
router.post("/",uploadNotice.single('noticeUpload'), createNotice);

// Route to get all notices
router.get("/", getAllNotices);

// Route to get notices by date range
router.get("/date", getNoticesByDate);

// Route to get a single notice by ID
router.get("/:id", getNoticeById);

// Route to update a notice by ID
router.put("/:id",uploadNotice.single('noticeUpload'), updateNotice);

// Route to delete a notice by ID
router.delete("/:id", deleteNotice);

export default router;