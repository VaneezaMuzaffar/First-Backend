const ClassAssignment = require('../model/ClassAssignment');
const Class = require('../model/Class');
const User = require('../model/User');

// @desc    Assign class to student
// @route   POST /api/assignments
// @access  Private/Admin
const assignClassToStudent = async (req, res) => {
  try {
    const { student, studentId, class: classFromBody, classId, notes, assignedBy } = req.body;
    
    // Support both field naming conventions
    const actualStudentId = studentId || student;
    const actualClassId = classId || classFromBody;
    
    console.log('Assignment request - Student:', actualStudentId, 'Class:', actualClassId);

    // Validate student exists
    const studentData = await User.findById(actualStudentId);
    if (!studentData) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Validate class exists
    const classRecord = await Class.findById(actualClassId);
    if (!classRecord) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if assignment already exists
    const existingAssignment = await ClassAssignment.findOne({
      student: actualStudentId,
      class: actualClassId,
      status: 'active'
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: `Student "${studentData.name}" is already assigned to class "${classRecord.className}"`
      });
    }

    // Check class capacity
    const currentEnrollments = await ClassAssignment.countDocuments({
      class: actualClassId,
      status: 'active'
    });

    if (currentEnrollments >= classRecord.capacity) {
      return res.status(400).json({
        success: false,
        message: `Class "${classRecord.className}" has reached maximum capacity (${classRecord.capacity} students)`
      });
    }

    // Handle assignedBy automatically - NO HARDCODED ID!
    let assignedById = assignedBy;
    if (!assignedById) {
      const adminUser = await User.findOne({ 
        $or: [
          { role: 'admin' },
          { role: 'teacher' }
        ]
      });
      
      if (adminUser) {
        assignedById = adminUser._id;
        console.log('Auto-assigned by:', adminUser.name);
      } else {
        const anyUser = await User.findOne();
        if (anyUser) {
          assignedById = anyUser._id;
          console.log('Auto-assigned by first user:', anyUser.name);
        } else {
          return res.status(400).json({
            success: false,
            message: 'No users found in system'
          });
        }
      }
    }

    // Create new assignment
    const assignment = new ClassAssignment({
      student: actualStudentId,
      class: actualClassId,
      assignedBy: assignedById,
      notes: notes || ''
    });

    await assignment.save();

    // Populate the response
    await assignment.populate('student', 'name email phone');
    await assignment.populate('class', 'className classCode instructor');
    await assignment.populate('assignedBy', 'name email');

    console.log('Assignment created successfully');

    res.status(201).json({
      success: true,
      message: `Student "${studentData.name}" assigned to class "${classRecord.className}" successfully`,
      data: assignment
    });

  } catch (error) {
    console.error('Error in assignClassToStudent:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.email) {
        // This means the old email index still exists - need to drop it
        return res.status(500).json({
          success: false,
          message: 'Database configuration error. Please run: db.classassignments.dropIndex("email_1")'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Student is already assigned to this class'
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error assigning class: ' + error.message
    });
  }
};

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
const getAllAssignments = async (req, res) => {
  try {
    const { page = 1, limit = 10, studentId, classId, status } = req.query;
    
    const query = {};
    if (studentId) query.student = studentId;
    if (classId) query.class = classId;
    if (status) query.status = status;

    const assignments = await ClassAssignment.find(query)
      .populate('student', 'name email phone')
      .populate('class', 'className classCode instructor schedule')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ClassAssignment.countDocuments(query);

    res.json({
      success: true,
      data: assignments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalAssignments: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assignments',
      error: error.message
    });
  }
};

// @desc    Get assignments for a student
// @route   GET /api/assignments/student/:studentId
// @access  Private
const getStudentAssignments = async (req, res) => {
  try {
    const assignments = await ClassAssignment.find({
      student: req.params.studentId
    })
    .populate('class', 'className classCode instructor schedule description')
    .populate('assignedBy', 'name')
    .sort({ assignmentDate: -1 });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student assignments',
      error: error.message
    });
  }
};

// @desc    Update assignment status
// @route   PUT /api/assignments/:id
// @access  Private/Admin
const updateAssignmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const assignment = await ClassAssignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    assignment.status = status;
    if (notes) assignment.notes = notes;
    
    if (status === 'completed') {
      assignment.completionDate = new Date();
    }

    await assignment.save();

    await assignment.populate('student', 'name email');
    await assignment.populate('class', 'className classCode');

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating assignment',
      error: error.message
    });
  }
};

// @desc    Remove assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Admin
const removeAssignment = async (req, res) => {
  try {
    const assignment = await ClassAssignment.findByIdAndDelete(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Assignment removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing assignment',
      error: error.message
    });
  }
};

// @desc    Get assignment statistics
// @route   GET /api/assignments/stats
// @access  Private/Admin
const getAssignmentStats = async (req, res) => {
  try {
    const totalAssignments = await ClassAssignment.countDocuments();
    const activeAssignments = await ClassAssignment.countDocuments({ status: 'active' });
    const completedAssignments = await ClassAssignment.countDocuments({ status: 'completed' });
    
    const classStats = await ClassAssignment.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: '$class',
          studentCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'classes',
          localField: '_id',
          foreignField: '_id',
          as: 'classInfo'
        }
      },
      {
        $unwind: '$classInfo'
      },
      {
        $project: {
          className: '$classInfo.className',
          classCode: '$classInfo.classCode',
          studentCount: 1,
          capacity: '$classInfo.capacity'
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalAssignments,
        activeAssignments,
        completedAssignments,
        classStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assignment statistics',
      error: error.message
    });
  }
};

module.exports = {
  assignClassToStudent,
  getAllAssignments,
  getStudentAssignments,
  updateAssignmentStatus,
  removeAssignment,
  getAssignmentStats
};