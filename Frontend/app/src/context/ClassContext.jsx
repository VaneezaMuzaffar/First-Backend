import React, { createContext, useState, useContext } from 'react';
import axios from "axios";

const ClassContext = createContext();

export const ClassProvider = ({ children }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:8000/api/v1/class';

  // Fetch all classes
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      const data = await response.json();
      
      if (response.ok) {
        setClasses(data.classes || data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      alert('Error fetching classes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new class
  const createClass = async (classData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await fetchClasses(); // Refresh the list
        return data;
      } else {
        throw new Error(data.message || 'Failed to create class');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update class
  const updateClass = async (classId, classData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${classId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await fetchClasses(); // Refresh the list
        return data;
      } else {
        throw new Error(data.message || 'Failed to update class');
      }
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete class
  const deleteClass = async (classId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${classId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await fetchClasses(); // Refresh the list
        return data;
      } else {
        throw new Error(data.message || 'Failed to delete class');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get class students
  const getClassStudents = async (classId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${classId}/students`);
      const data = await response.json();
      
      if (response.ok) {
        return data.data || data.students || [];
      } else {
        throw new Error(data.message || 'Failed to fetch class students');
      }
    } catch (error) {
      console.error('Error fetching class students:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    classes,
    loading,
    createClass,
    fetchClasses,
    updateClass,
    deleteClass,
    getClassStudents,
  };

  return (
    <ClassContext.Provider value={value}>
      {children}
    </ClassContext.Provider>
  );
};

export const useClass = () => {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error('useClass must be used within a ClassProvider');
  }
  return context;
};

export default ClassContext;