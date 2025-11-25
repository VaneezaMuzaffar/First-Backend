// controllers/classController.js
// ✅ Correct
const Class = require('../model/Class');
const ClassAssignment = require('../model/ClassAssignment');

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private/Admin
const createClass = async (req, res) => {
  try {
    const { className, classCode, description, instructor, schedule, capacity } = req.body;

    // Check if class code already exists
    const existingClass = await Class.findOne({ classCode: classCode.toUpperCase() });
    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: 'Class code already exists'
      });
    }

    const newClass = new Class({
      className,
      classCode: classCode.toUpperCase(),
      description,
      instructor,
      schedule,
      capacity: capacity || 30
    });

    await newClass.save();

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: newClass
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating class',
      error: error.message
    });
  }
};

// @desc    Get all classes
// @route   GET /api/classes
// @access  Public
const getAllClasses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, active } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { className: { $regex: search, $options: 'i' } },
        { classCode: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const classes = await Class.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Class.countDocuments(query);

    res.json({
      success: true,
      data: classes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalClasses: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching classes',
      error: error.message
    });
  }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Public
const getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Get enrolled students count
    const enrolledStudents = await ClassAssignment.countDocuments({
      class: req.params.id,
      status: 'active'
    });

    const classWithEnrollment = {
      ...classData.toObject(),
      enrolledStudents
    };

    res.json({
      success: true,
      data: classWithEnrollment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching class',
      error: error.message
    });
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private/Admin
const updateClass = async (req, res) => {
  try {
    const { className, description, instructor, schedule, capacity, isActive } = req.body;

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      {
        className,
        description,
        instructor,
        schedule,
        capacity,
        isActive,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: updatedClass
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating class',
      error: error.message
    });
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private/Admin
const deleteClass = async (req, res) => {
  try {
    // Check if class has active assignments
    const activeAssignments = await ClassAssignment.countDocuments({
      class: req.params.id,
      status: 'active'
    });

    if (activeAssignments > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete class with active student assignments'
      });
    }

    const deletedClass = await Class.findByIdAndDelete(req.params.id);

    if (!deletedClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting class',
      error: error.message
    });
  }
};

// @desc    Get students enrolled in a class
// @route   GET /api/classes/:id/students
// @access  Private
const getClassStudents = async (req, res) => {
  try {
    const assignments = await ClassAssignment.find({
      class: req.params.id,
      status: 'active'
    }).populate('student', 'name email phone');

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching class students',
      error: error.message
    });
  }
};

module.exports = {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
  getClassStudents
};