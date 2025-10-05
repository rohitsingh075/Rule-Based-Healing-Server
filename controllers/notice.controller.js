import { Notice } from "../models/notice.model.js";
import { APIresponse } from "../utils/APIresponse.js";
import { APIError } from "../utils/APIerror.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new notice
export const createNotice = asyncHandler(async (req, res) => {
  console.log("REQUEST BODY:", req.body);
  console.log("REQUEST FILE:", req.file);
  
  const { title, description, issuedBy, important, tags } = req.body;

  // Validate required fields
  if (!title || !description) {
    throw new APIError(400, "Missing required fields: title or description");
  }
  
  // Get the file path from req.file
  const noticeUpload = req.file ? req.file.path : null;
  console.log("File path:", noticeUpload);

  // Handle tags - ensure they're an array
  let parsedTags = [];
  if (tags) {
    parsedTags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
  }

  const notice = new Notice({
    title,
    description,
    issuedBy: issuedBy || "Admin",
    important: important === true || important === "true",
    tags: parsedTags,
    noticeUpload,
  });

  const savedNotice = await notice.save();
  res.status(201).json(new APIresponse(201, savedNotice, "Notice created successfully"));
});

// Get all notices
export const getAllNotices = asyncHandler(async (req, res) => {
  const notices = await Notice.find();
  res.status(200).json(new APIresponse(200, notices, "Notices fetched successfully"));
});

// Get a single notice by ID
export const getNoticeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!id) {
    throw new APIError(400, "Notice ID is required");
  }

  const notice = await Notice.findById(id);
  if (!notice) {
    throw new APIError(404, "Notice not found");
  }

  res.status(200).json(new APIresponse(200, notice, "Notice fetched successfully"));
});


// Get notices by date 
export const getNoticesByDate = asyncHandler(async (req, res) => {
    const { date } = req.body;
  
    // Validate date
    if (!date) {
      throw new APIError(400, "Date is required");
    }
  
    // Convert DD-MM-YYYY to a valid Date object
    const parseDate = (dateString) => {
      const [day, month, year] = dateString.split("-");
      return new Date(`${year}-${month}-${day}`);
    };
  
    const targetDate = parseDate(date);
    const start = targetDate.setHours(0, 0, 0, 0);
    const end = targetDate.setHours(23, 59, 59, 999);
  
    const notices = await Notice.find({
      date: {
        $gte: start,
        $lte: end,
      },
    });
  
    if (!notices || notices.length === 0) {
      throw new APIError(404, "No notices found for the given date");
    }
  
    res.status(200).json(new APIresponse(200, notices, "Notices fetched successfully for the given date"));
  });

// Update a notice by ID
// Update a notice by ID
// Update a notice by ID
export const updateNotice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log("ID:", id); // Log the ID for debugging
  const { title, description, issuedBy, important, tags, date } = req.body;

  // Validate ID
  if (!id) {
    throw new APIError(400, "Notice ID is required");
  }

  // Validate required fields if provided
  if (!title || !description) {
    throw new APIError(400, "Required fields cannot be empty");
  }

  // Validate date format if provided
  let parsedDate = null;
  if (date) {
    const parseDate = (dateString) => {
      const [year, month, day] = dateString.split("-"); // Expecting YYYY-MM-DD format
      const parsed = new Date(Date.UTC(year, month - 1, day)); // Use UTC to avoid time zone issues
      return parsed;
    };
    parsedDate = parseDate(date);
    if (isNaN(parsedDate)) {
      throw new APIError(400, "Invalid date format. Use YYYY-MM-DD.");
    }
  }

  // Handle tags - ensure they're an array
  let parsedTags = [];
  if (tags) {
    parsedTags = Array.isArray(tags) ? tags : tags.split(",").map((tag) => tag.trim());
  }

  // Handle file upload
  const noticeUpload = req.file ? req.file.path : undefined;

  // Prepare the update object
  const updateData = {
    title,
    description,
    issuedBy,
    important: important === true || important === "true",
    tags: parsedTags,
    ...(parsedDate && { date: parsedDate }),
    ...(noticeUpload && { noticeUpload }), // Only include noticeUpload if a file is uploaded
  };

  const updatedNotice = await Notice.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedNotice) {
    throw new APIError(404, "Notice not found");
  }

  res.status(200).json(new APIresponse(200, updatedNotice, "Notice updated successfully"));
});
  
// Delete a notice by ID
export const deleteNotice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!id) {
    throw new APIError(400, "Notice ID is required");
  }

  const deletedNotice = await Notice.findByIdAndDelete(id);
  if (!deletedNotice) {
    throw new APIError(404, "Notice not found");
  }

  res.status(200).json(new APIresponse(200, null, "Notice deleted successfully"));
});

export const uploadNoticeFileHandler = async (req, res) => {
  try {
    const {id} = req.params.id;

    if (!req.file) {
      return res.status(400).json({ error: "No Photo/File uploaded." });
    }
    console.log("File :", req.file); // Log the uploaded file for debugging
    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ error: "Event not found." });
    }

    // Save photo filename in event document
    notice.photo = req.file.filename;
    await notice.save();

    res.status(200).json({
      message: "Event photo uploaded and updated.",
      file: req.file,
      notice,
    });

  } catch (error) {
    console.error("Upload Event Photo Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
