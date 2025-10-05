// /middlewares/uploadTransferCertificate.js
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/noticeUploads");
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueName + ext);
    },
});

const fileFilter = (req, file, cb) => {
    console.log("Processing file:", file.originalname, file.mimetype);
    
    // Allow only PDF or image files
    if (file.mimetype === "application/pdf" || file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      console.log("File rejected:", file.originalname, file.mimetype);
      cb(new Error("Only PDF or image files are allowed"));
    }
  };

const check = () => {
    console.log("done");

}


export const uploadNotice = multer({
    storage:storage,
    fileFilter,
    check,
});
