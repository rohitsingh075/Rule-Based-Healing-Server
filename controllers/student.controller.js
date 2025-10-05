import { Student } from "../models/student.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIerror.js";

// Helper function to parse DD-MM-YYYY to a valid Date object
const parseDate = (dateString) => {
  let day, month, year;

  // Remove time if present (e.g., "2025-01-01T00:00:00.000Z" → "2025-01-01")
  if (dateString.includes("T")) {
    dateString = dateString.split("T")[0];
  }

  // Case 1: ddmmyyyy (e.g., 01012025)
  if (/^\d{8}$/.test(dateString)) {
    const possibleDay = parseInt(dateString.slice(0, 2));
    const possibleMonth = parseInt(dateString.slice(2, 4));

    if (possibleDay <= 31 && possibleMonth <= 12) {
      day = dateString.slice(0, 2);
      month = dateString.slice(2, 4);
      year = dateString.slice(4, 8);
    } else {
      // Assume reverse: yyyymmdd (e.g., 20250101)
      year = dateString.slice(0, 4);
      month = dateString.slice(4, 6);
      day = dateString.slice(6, 8);
    }
  }
  // Case 2: dd-mm-yyyy
  else if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    [day, month, year] = dateString.split("-");
  }
  // Case 3: yyyy-mm-dd
  else if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    [year, month, day] = dateString.split("-");
  }
  else {
    throw new APIError(400, "Invalid date format. Use DD-MM-YYYY, YYYY-MM-DD, DDMMYYYY, YYYYMMDD, or ISO format.");
  }

  const parsedDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  if (isNaN(parsedDate.getTime())) {
    throw new APIError(400, "Invalid date.");
  }

  return parsedDate;
};

// Create a new student
export const createStudent = asyncHandler(async (req, res) => {
  console.log("Request body:", req.body); // Log the request body for debugging
  const {
    name,
    srNo,
    fatherName,
    motherName,
    session,
    class: studentClass,
    section,
    dob,
    gender,
    address,
    phoneNo,
    rlyWard,
    caste,
    aadharNo,
    house,
    religion,
    schoolLeavingDate
  } = req.body;

  // Basic validation
  if (!name || !srNo || !session || !studentClass || !section || !address || !dob || !gender) {
    throw new APIError(400, "Name, Sr No, Session, Class, Section, Address, DOB, and Gender are required.");
  }

  // Parse DOB
  let parsedDob = parseDate(dob);

  // Parse School Leaving Date (optional)
  let parsedSchoolLeavingDate = null;
  if (schoolLeavingDate && schoolLeavingDate !== "null" && schoolLeavingDate.trim() !== "") {
    parsedSchoolLeavingDate = parseDate(schoolLeavingDate);
  }

  console.log(srNo); // Log for debugging

  // Check for duplicate student by srNo and session
  const existingStudent = await Student.findOne({ srNo, session });
  if (existingStudent) {
    throw new APIError(409, "Student with the same Sr No already exists.");
  }

  // Handle transferCertificate file
  const transferCertificate = req.file ? req.file.path : undefined;

  const newStudent = new Student({
    name,
    fatherName,
    motherName,
    srNo,
    session,
    class: studentClass,
    section,
    dob: parsedDob,
    gender,
    address,
    phoneNo,
    rlyWard,
    caste,
    aadharNo,
    house,
    religion,
    transferCertificate,
    schoolLeavingDate: parsedSchoolLeavingDate,
  });

  await newStudent.save();

  res.status(201).json({
    status: 201,
    message: "Student created successfully",
    student: newStudent,
  });
});


// Get student by ID
export const getStudentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new APIError(400, "Student ID is required");

  const student = await Student.findById(id);
  if (!student) throw new APIError(404, "Student not found");

  res.status(200).json({
    status: 200,
    student,
  });
});

// Update student
export const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  if (!id) throw new APIError(400, "Student ID is required");

  // Parse the date of birth if provided
  if (updatedData.dob) {
    updatedData.dob = parseDate(updatedData.dob);
  }

  // Parse the schoolLeavingDate if provided
  if (updatedData.schoolLeavingDate && updatedData.schoolLeavingDate !== "null" && updatedData.schoolLeavingDate.trim() !== "") {
    updatedData.schoolLeavingDate = parseDate(updatedData.schoolLeavingDate);
  } else {
    updatedData.schoolLeavingDate = null;
  }

  // Handle transferCertificate file
  if (req.file) {
    updatedData.transferCertificate = req.file.path;
  }

  const updatedStudent = await Student.findByIdAndUpdate(id, updatedData, {
    new: true,
  });

  if (!updatedStudent) {
    throw new APIError(404, "Student not found");
  }

  res.status(200).json({
    status: 200,
    message: "Student updated successfully",
    student: updatedStudent,
  });
});


// Delete student
export const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new APIError(400, "Student ID is required");

  const deletedStudent = await Student.findByIdAndDelete(id);

  if (!deletedStudent) {
    throw new APIError(404, "Student not found");
  }

  res.status(200).json({
    status: 200,
    message: "Student deleted successfully",
  });
});

// Get students by filters
export const getStudents = asyncHandler(async (req, res) => {
  const {
    name,
    session,
    class: studentClass,
    section,
    srNo,
    gender,
    rlyWard,
    caste,
    aadharNo,
    house,
  } = req.query;

  const filter = {};
  if (name) filter.name = { $regex: name, $options: "i" }; // Case-insensitive search
  if (session) filter.session = session;
  if (studentClass) filter.class = studentClass;
  if (section) filter.section = section;
  if (srNo) filter.srNo = srNo;
  if (gender) filter.gender = gender;
  if (rlyWard) filter.rlyWard = rlyWard;
  if (caste) filter.caste = caste;
  if (aadharNo) filter.aadharNo = aadharNo;
  if (house) filter.house = house;

  const students = await Student.find(filter);

  if (!students || students.length === 0) {
    throw new APIError(404, "No students found for the given criteria");
  }

  res.status(200).json({
    status: 200,
    message: "Students fetched successfully",
    students,
  });
});

// Get all students
export const getAllStudents = asyncHandler(async (req, res) => {
  const students = await Student.find();

  if (!students || students.length === 0) {
    throw new APIError(404, "No students found in the database");
  }

  res.status(200).json({
    status: 200,
    message: "All students fetched successfully",
    students,
  });
});

// Upload Transfer Certificate
export const uploadTCHandler = async (req, res) => {
  try {
    const studentId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Save TC filename to DB
    student.transferCertificate = req.file.filename;
    await student.save();

    res.status(200).json({
      message: "Transfer Certificate uploaded and updated.",
      file: req.file,
      student,
    });
  } catch (error) {
    console.error("Upload TC Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
