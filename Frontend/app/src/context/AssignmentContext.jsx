import React, { createContext, useState, useContext } from 'react';
import axios from "axios";

const AssignmentContext = createContext();

export const AssignmentProvider = ({ children }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:8000/api/v1/assignment';

  // Fetch all assignments
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/`);
      setAssignments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch assignments';
      alert('Error: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Assign class to student - FIXED VERSION
  const assignClassToStudent = async (assignmentData) => {
    setLoading(true);
    try {
      console.log('Sending assignment request to backend:', assignmentData);
      
      // Send ONLY student, class, and notes - backend will handle assignedBy automatically
      const backendData = {
        student: assignmentData.student,
        class: assignmentData.class,
        notes: assignmentData.notes || ''
        // REMOVE assignedBy completely - let backend handle it
      };
      
      console.log('Transformed data for backend:', backendData);
      
      const response = await axios.post(`${API_BASE_URL}/`, backendData);
      
      console.log('Assignment successful response:', response.data);
      
      // Refresh assignments list
      await fetchAssignments();
      
      return response.data;
    } catch (error) {
      console.error('Full assignment error details:', error);
      
      let errorMessage = 'Failed to assign class';
      
      if (error.response) {
        console.error('Backend error response:', error.response.data);
        errorMessage = error.response.data?.message || errorMessage;
        
        // Check for specific database errors
        if (error.response.data?.message?.includes('email_1')) {
          errorMessage = 'Database configuration error. Please run the database fix.';
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        console.error('Request setup error:', error.message);
        errorMessage = error.message || errorMessage;
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get assignments by student
  const getStudentAssignments = async (studentId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/student/${studentId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching student assignments:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch student assignments';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Remove assignment
  const removeAssignment = async (assignmentId) => {
    setLoading(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/${assignmentId}`);
      await fetchAssignments();
      return response.data;
    } catch (error) {
      console.error('Error removing assignment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to remove assignment';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Add this function to check database status
  const checkDatabaseStatus = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/check-indexes`);
      return response.data;
    } catch (error) {
      console.error('Error checking database status:', error);
      throw new Error('Failed to check database status');
    } finally {
      setLoading(false);
    }
  };

  // Add this function to fix database
  const fixDatabase = async () => {
    setLoading(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/fix-database`);
      await fetchAssignments();
      return response.data;
    } catch (error) {
      console.error('Error fixing database:', error);
      throw new Error('Failed to fix database');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    assignments,
    loading,
    assignClassToStudent,
    fetchAssignments,
    getStudentAssignments,
    removeAssignment,
    checkDatabaseStatus,
    fixDatabase,
  };

  return (
    <AssignmentContext.Provider value={value}>
      {children}
    </AssignmentContext.Provider>
  );
};

export const useAssignment = () => {
  const context = useContext(AssignmentContext);
  if (!context) {
    throw new Error('useAssignment must be used within an AssignmentProvider');
  }
  return context;
};

export default AssignmentContext;