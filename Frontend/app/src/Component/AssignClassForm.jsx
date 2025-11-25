import React, { useState, useEffect } from 'react';
import { useAssignment } from '../context/AssignmentContext';
import { useUser } from '../context/UserContext';

// AssignClassForm component - USING USERCONTEXT
const AssignClassForm = ({ classId, onSuccess }) => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [notes, setNotes] = useState('');
  const { assignClassToStudent, loading } = useAssignment();
  const { getStudents, fetchUsers, loading: usersLoading, users } = useUser();

  const students = getStudents();

  useEffect(() => {
    // Only fetch users if we don't have any
    if (users.length === 0) {
      fetchUsers();
    }
  }, [fetchUsers, users.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      alert('Please select a student');
      return;
    }

    if (!classId) {
      alert('Class ID is missing');
      return;
    }

    try {
      console.log('Submitting assignment with:', {
        student: selectedStudent,
        class: classId,
        notes: notes,
      });

      // Send only student, class, and notes - backend will handle assignedBy
      await assignClassToStudent({
        student: selectedStudent,
        class: classId,
        notes: notes,
      });
      
      alert('Student assigned successfully!');
      onSuccess();
      
      // Reset form
      setSelectedStudent('');
      setNotes('');
    } catch (err) {
      console.error('Assignment error:', err);
      alert(err.message || 'Error assigning student. Please check console for details.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 grid gap-4">
      <label className="block text-sm font-medium">Student *</label>
      
      {usersLoading ? (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading students...</p>
        </div>
      ) : (
        <select
          required
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading || students.length === 0}
        >
          <option value="">
            {students.length === 0 ? 'No students available' : 'Select Student'}
          </option>
          {students.map((student) => (
            <option key={student._id} value={student._id}>
              {student.name || student.username} ({student.email})
            </option>
          ))}
        </select>
      )}

      {students.length === 0 && !usersLoading && (
        <p className="text-red-500 text-sm">
          No students found. Please make sure you have students in your database.
        </p>
      )}

      <label className="block text-sm font-medium">Notes</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Optional notes"
        rows="3"
        disabled={loading}
      />

      <button 
        type="submit" 
        className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition disabled:opacity-50"
        disabled={loading || !selectedStudent || students.length === 0}
      >
        {loading ? 'Assigning...' : 'Assign Student'}
      </button>

      {/* Debug info */}
      <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
        <div><strong>Debug Info:</strong></div>
        <div>Available Students: {students.length}</div>
        <div>Selected Class: {classId}</div>
        <div>Selected Student: {selectedStudent}</div>
      </div>
    </form>
  );
};

export default AssignClassForm;