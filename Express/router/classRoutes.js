const express = require('express');
const {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
  getClassStudents
} = require('../controller/Classes'); // ✅ CORRECT - Use actual file name

const router = express.Router();

// Class Routes
router.post('/', createClass);
router.get('/', getAllClasses);
router.get('/:id', getClassById);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);
router.get('/:id/students', getClassStudents);

module.exports = router;