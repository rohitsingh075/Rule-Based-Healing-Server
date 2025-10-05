// import express from "express";

// // Middleware for handling file uploads
// import { uploadTransferCertificate } from "../middlewares/transferCertificate.multer.js";
import { uploadEventPhoto } from "../middlewares/eventphoto.multer.js";

// import { uploadTCHandler } from "../controllers/student.controller.js";
// import { uploadEventPhotoHandler } from "../controllers/event.controller.js";

// const router = express.Router();

// // 🧾 Upload TC for student using student ID in param
// router.post('/upload/tc/:id', uploadTransferCertificate.single('tc'), uploadTCHandler);

// // 📸 Upload event photo using event ID in param
router.post('/upload/eventphoto/:id', uploadEventPhoto.single('event'), uploadEventPhotoHandler);

// export default router;
