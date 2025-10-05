// /middlewares/uploadTransferCertificate.js
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/transferCertificates");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only PDF or image files
  if (file.mimetype === "application/pdf" || file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF or image files are allowed for TC"));
  }
};

export const uploadTransferCertificate = multer({ 
  storage,
  fileFilter,
});
