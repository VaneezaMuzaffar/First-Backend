const express = require('express');
const {
  assignClassToStudent,
  getAllAssignments,
  getStudentAssignments,
  updateAssignmentStatus,
  removeAssignment,
  getAssignmentStats
} = require('../controller/ClassAssign'); // ✅ CORRECT - Use actual file name

const router = express.Router();

// Assignment Routes
router.post('/', assignClassToStudent);
router.get('/', getAllAssignments);
router.get('/stats', getAssignmentStats);
router.get('/student/:studentId', getStudentAssignments);
router.put('/:id', updateAssignmentStatus);
router.delete('/:id', removeAssignment);

module.exports = router;