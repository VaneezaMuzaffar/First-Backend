import React, { useState, useEffect } from 'react';
import { useClass } from '../context/ClassContext';
import { useAssignment } from '../context/AssignmentContext';
import { useUser } from '../context/UserContext';
import AssignClassForm from './AssignClassForm';

const Class = () => {
  const {
    classes,
    loading: classLoading,
    createClass,
    fetchClasses,
    updateClass,
    deleteClass,
    getClassStudents,
  } = useClass();

  const { assignments, fetchAssignments, loading: assignmentLoading } = useAssignment();
  const { getUserById, users, fetchUsers, loading: usersLoading } = useUser();

  const [formData, setFormData] = useState({
    className: '',
    classCode: '',
    description: '',
    instructor: '',
    capacity: 30,
  });

  const [editingClass, setEditingClass] = useState(null);
  const [classStats, setClassStats] = useState({});
  const [selectedClassStudents, setSelectedClassStudents] = useState([]);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Fetch initial data with better loading handling
  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoaded(false);
        await Promise.all([
          fetchClasses(),
          fetchAssignments(),
          fetchUsers()
        ]);
        setDataLoaded(true);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setDataLoaded(true);
      }
    };
    loadData();
  }, []);

  // Update stats when classes or assignments change
  useEffect(() => {
    if (classes.length > 0 && assignments.length >= 0) {
      const stats = {};

      classes.forEach((classItem) => {
        const classAssignments = assignments.filter((assignment) => {
          const assignmentClassId = assignment.class?._id || assignment.class;
          return assignmentClassId === classItem._id;
        });

        stats[classItem._id] = {
          enrolled: classAssignments.length,
          available: classItem.capacity - classAssignments.length,
          percentage: classItem.capacity > 0 ? 
            Math.round((classAssignments.length / classItem.capacity) * 100) : 0,
        };
      });

      setClassStats(stats);
    }
  }, [classes, assignments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await updateClass(editingClass._id, formData);
        alert('Class updated successfully!');
      } else {
        await createClass(formData);
        alert('Class created successfully!');
      }

      setFormData({
        className: '',
        classCode: '',
        description: '',
        instructor: '',
        capacity: 30,
      });
      setEditingClass(null);
      fetchClasses();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (classItem) => {
    setFormData({
      className: classItem.className,
      classCode: classItem.classCode,
      description: classItem.description || '',
      instructor: classItem.instructor,
      capacity: classItem.capacity,
    });
    setEditingClass(classItem);
  };

  const handleDelete = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await deleteClass(classId);
        alert('Class deleted successfully!');
        fetchClasses();
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const handleViewStudents = async (classId) => {
    try {
      const students = await getClassStudents(classId);
      const enhancedStudents = students.map(assignment => {
        const studentId = assignment.student?._id || assignment.student;
        return {
          ...assignment,
          student: getUserById(studentId) || assignment.student
        };
      });
      setSelectedClassStudents(enhancedStudents);
      setShowStudentsModal(true);
    } catch (error) {
      alert('Error fetching students: ' + error.message);
    }
  };

  const handleAssignClass = (classItem) => {
    setSelectedClass(classItem);
    setShowAssignModal(true);
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Debug function to check data
  const debugData = () => {
    console.log('=== DEBUG DATA ===');
    console.log('Classes:', classes);
    console.log('Assignments:', assignments);
    console.log('Users:', users);
    console.log('Class Stats:', classStats);
    
    const students = users.filter(user => user.role === 'student');
    console.log('Available students:', students);
    
    if (assignments.length > 0) {
      console.log('First assignment structure:', assignments[0]);
    }
  };

  // Check assignment data function
  const checkAssignmentData = () => {
    const students = users.filter(user => user.role === 'student');
    console.log('Available students:', students);
    console.log('Current assignments:', assignments);
    console.log('Selected class:', selectedClass);
    
    if (selectedClass && students.length > 0) {
      console.log('Can assign:', students[0].name, 'to', selectedClass.className);
    }
    
    alert(`Check console for details. Available students: ${students.length}`);
  };

  // Add this function to check assignment blocking
  const checkAssignmentBlockers = () => {
    const students = users.filter(user => user.role === 'student');
    console.log('=== ASSIGNMENT BLOCKERS CHECK ===');
    
    if (selectedClass) {
      console.log('Selected Class:', selectedClass.className, selectedClass._id);
      
      // Check which students are already assigned to this class
      const assignedStudents = assignments.filter(assignment => 
        assignment.class?._id === selectedClass._id || assignment.class === selectedClass._id
      );
      
      console.log('Already assigned to this class:', assignedStudents.length);
      assignedStudents.forEach((assignment, index) => {
        const student = users.find(u => u._id === (assignment.student?._id || assignment.student));
        console.log(`${index + 1}. ${student?.name || 'Unknown'} (${assignment.student?._id || assignment.student})`);
      });
      
      // Check available students
      const availableStudents = students.filter(student => {
        const isAssigned = assignments.some(assignment => 
          (assignment.student?._id === student._id || assignment.student === student._id) &&
          (assignment.class?._id === selectedClass._id || assignment.class === selectedClass._id)
        );
        return !isAssigned;
      });
      
      console.log('Available students for this class:', availableStudents.length);
      availableStudents.forEach((student, index) => {
        console.log(`${index + 1}. ${student.name} (${student._id})`);
      });
      
      alert(`Assigned: ${assignedStudents.length}, Available: ${availableStudents.length}. Check console for details.`);
    } else {
      alert('Please select a class first');
    }
  };

  // Add this function to reset database
  const resetDatabase = async () => {
    if (!window.confirm('This will delete ALL assignments. Are you sure?')) return;
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/assignment/fix-database', {
        method: 'DELETE'
      });
      const result = await response.json();
      console.log('Reset result:', result);
      
      if (response.ok) {
        alert('Database reset successfully!');
        fetchAssignments();
        fetchClasses();
      } else {
        alert('Reset failed: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Reset error:', error);
      alert('Reset error: ' + error.message);
    }
  };

  // Quick Test - Direct Assignment Debug Function
  const testDirectAssignment = async () => {
    try {
      if (!selectedClass || users.length === 0) {
        alert('Please select a class first and make sure students are loaded');
        return;
      }

      const students = users.filter(user => user.role === 'student');
      if (students.length === 0) {
        alert('No students found in the database');
        return;
      }

      // Use a student that's not already assigned to this class
      const availableStudents = students.filter(student => {
        const isAssigned = assignments.some(assignment => 
          (assignment.student?._id === student._id || assignment.student === student._id) &&
          (assignment.class?._id === selectedClass._id || assignment.class === selectedClass._id)
        );
        return !isAssigned;
      });

      if (availableStudents.length === 0) {
        alert('All students are already assigned to this class');
        return;
      }

      const testData = {
        student: availableStudents[0]._id,
        class: selectedClass._id,
        notes: 'Test assignment from debug button'
      };

      console.log('Testing direct assignment with:', testData);

      

      // Add this function to check database status
const checkDatabaseStatus = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/assignment/check-indexes');
    const result = await response.json();
    console.log('Database Status:', result);
    
    if (result.success) {
      alert(`Database Indexes: ${result.indexes.join(', ')}\nHas Email Index: ${result.hasEmailIndex}`);
    } else {
      alert('Failed to check database status');
    }
  } catch (error) {
    console.error('Database check error:', error);
    alert('Error checking database: ' + error.message);
  }
};

// Add this function to fix database via API
const fixDatabaseViaAPI = async () => {
  if (!window.confirm('This will delete ALL assignments and fix indexes. Continue?')) return;
  
  try {
    const response = await fetch('http://localhost:8000/api/v1/assignment/fix-database', {
      method: 'DELETE'
    });
    const result = await response.json();
    console.log('Database fix result:', result);
    
    if (result.success) {
      alert(`Database fixed! Deleted ${result.deletedAssignments} assignments.\nIndexes before: ${result.indexesBefore.join(', ')}\nIndexes after: ${result.indexesAfter.join(', ')}`);
      fetchAssignments();
      fetchClasses();
    } else {
      alert('Database fix failed: ' + (result.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Database fix error:', error);
    alert('Error fixing database: ' + error.message);
  }
};
      
      const response = await fetch('http://localhost:8000/api/v1/assignment/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      console.log('Direct test result:', result);

      if (response.ok) {
        alert('Direct test successful! Student assigned to class.');
        fetchAssignments();
        fetchClasses();
      } else {
        alert('Direct test failed: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Direct test error:', error);
      alert('Direct test error: ' + error.message);
    }
  };

  // Show loading state while data is being fetched
  if ((classLoading || assignmentLoading || usersLoading) && !dataLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading class data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Class Management</h1>

        {/* Debug buttons */}
        <div className="flex gap-2 mb-4">
          <button 
            onClick={debugData}
            className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600"
          >
            Debug Data
          </button>
          <button 
            onClick={checkAssignmentData}
            className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600"
          >
            Check Assignment Data
          </button>
          <button 
            onClick={checkAssignmentBlockers}
            className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600"
          >
            Check Blockers
          </button>
          <button 
            onClick={testDirectAssignment}
            className="bg-purple-500 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-600"
          >
            Test Direct Assignment
          </button>
          <button 
            onClick={resetDatabase}
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
          >
            Reset Database
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{classes.length}</div>
            <div className="text-sm text-gray-600">Total Classes</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {assignments.length}
            </div>
            <div className="text-sm text-gray-600">Total Assignments</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {classes.reduce((total, c) => total + c.capacity, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Capacity</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(
                (assignments.length /
                  (classes.reduce((total, c) => total + c.capacity, 0) || 1)) *
                  100
              ) || 0}
              %
            </div>
            <div className="text-sm text-gray-600">Overall Occupancy</div>
          </div>
        </div>

        {/* Class Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            {editingClass ? 'Update Class' : 'Create New Class'}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Class Name *</label>
              <input
                type="text"
                required
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter class name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Class Code *</label>
              <input
                type="text"
                required
                value={formData.classCode}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  classCode: e.target.value.toUpperCase().replace(/\s/g, '')
                })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., MATH101"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Instructor *</label>
              <input
                type="text"
                required
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter instructor name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Capacity *</label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  capacity: parseInt(e.target.value) || 1 
                })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter class description (optional)"
              />
            </div>

            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                disabled={classLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {classLoading ? 'Processing...' : editingClass ? 'Update Class' : 'Create Class'}
              </button>

              {editingClass && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingClass(null);
                    setFormData({
                      className: '',
                      classCode: '',
                      description: '',
                      instructor: '',
                      capacity: 30,
                    });
                  }}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Class List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">All Classes ({classes.length})</h2>
            <button
              onClick={() => {
                fetchClasses();
                fetchAssignments();
                fetchUsers();
              }}
              className="bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 transition"
              disabled={classLoading || assignmentLoading}
            >
              {classLoading || assignmentLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {classLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading classes...</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No classes found. Create your first class above.
            </div>
          ) : (
            <div className="grid gap-6">
              {classes.map((classItem) => {
                const stats = classStats[classItem._id] || {
                  enrolled: 0,
                  available: classItem.capacity,
                  percentage: 0,
                };

                return (
                  <div
                    key={classItem._id}
                    className="border rounded-lg p-6 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold">
                            {classItem.className}
                          </h3>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                            {classItem.classCode}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-1">
                          <strong>Instructor:</strong> {classItem.instructor}
                        </p>
                        <p className="text-gray-600 text-sm mb-4">
                          <strong>Capacity:</strong> {classItem.capacity} students
                        </p>

                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>
                              Enrollment: {stats.enrolled} / {classItem.capacity}
                            </span>
                            <span>{stats.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(
                                stats.percentage
                              )}`}
                              style={{
                                width: `${Math.min(stats.percentage, 100)}%`,
                              }}
                            />
                          </div>
                        </div>

                        {classItem.description && (
                          <p className="text-gray-500 text-sm">
                            {classItem.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => handleViewStudents(classItem._id)}
                          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition text-sm"
                        >
                          View Students ({stats.enrolled})
                        </button>

                        <button
                          onClick={() => handleAssignClass(classItem)}
                          className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition text-sm"
                        >
                          Assign Student
                        </button>

                        <button
                          onClick={() => handleEdit(classItem)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition text-sm"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(classItem._id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Students Modal */}
        {showStudentsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-lg font-semibold">Enrolled Students</h3>
                <button
                  onClick={() => setShowStudentsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition text-xl"
                >
                  ✖
                </button>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                {selectedClassStudents.length > 0 ? (
                  selectedClassStudents.map((assignment, index) => (
                    <div
                      key={assignment._id || index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-md mb-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center rounded-full text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">
                            {assignment.student?.name || assignment.student?.username || 'Unknown Student'}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {assignment.student?.email || 'No email'}
                          </p>
                          {assignment.notes && (
                            <p className="text-gray-400 text-xs mt-1">
                              Notes: {assignment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-500 text-sm">
                        {new Date(assignment.assignmentDate || assignment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No students enrolled in this class.
                  </p>
                )}
              </div>

              <div className="flex justify-end p-6 border-t">
                <button
                  onClick={() => setShowStudentsModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Class Modal */}
        {showAssignModal && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-lg font-semibold">
                  Assign Student to {selectedClass.className}
                </h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition text-xl"
                >
                  ✖
                </button>
              </div>

              <AssignClassForm
                classId={selectedClass._id}
                onSuccess={() => {
                  setShowAssignModal(false);
                  setSelectedClass(null);
                  fetchAssignments();
                  fetchClasses();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Class;