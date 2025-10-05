import express from 'express';
import { createStudent,getStudentById,updateStudent,deleteStudent,getStudents,getAllStudents, uploadTCHandler } from '../controllers/student.controller.js';
import { uploadTransferCertificate } from '../middlewares/transferCertificate.multer.js';

const router = express.Router();

router.post('/',uploadTransferCertificate.single('transferCertificate'), createStudent);

// Get all students by session, class, section or rollNo
router.get('/', getAllStudents); 

router.get('/filter', getStudents); // Get all students by session, class, section or rollNo
// router.get('/filter', filterStudents); 
// 🔍 filter route // 🔍 filter route


router.get('/:id', getStudentById);

router.put('/:id',uploadTransferCertificate.single('transferCertificate'), updateStudent);

router.delete('/:id', deleteStudent);


export default router;
