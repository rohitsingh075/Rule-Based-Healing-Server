// /middlewares/uploadEventPhoto.js
import multer from "multer";
import path from "path";


const check=()=>{
  console.log("Event photo upload middleware initialized.");
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/eventPhotos");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only images
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed for event photo"));
  }
};

export const uploadEventPhoto = multer(
  
  {
  check,
  storage: storage,
  // destination: "./uploads/eventPhotos",
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // Max 20MB
});
