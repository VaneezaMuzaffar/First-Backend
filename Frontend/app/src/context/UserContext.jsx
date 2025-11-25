import React, { createContext, useReducer, useEffect, useContext } from "react";
import axios from "axios";

// Create Context
const UserContext = createContext();

// Initial State
const initialState = {
  users: [],
  loading: false,
  error: null,
};

// Reducer
const userReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_USERS":
      return { ...state, users: action.payload, loading: false };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "ADD_USER":
      return { ...state, users: [...state.users, action.payload] };
    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((u) =>
          u._id === action.payload._id ? action.payload : u
        ),
      };
    case "DELETE_USER":
      return {
        ...state,
        users: state.users.filter((u) => u._id !== action.payload),
      };
    default:
      return state;
  }
};

// Base API URL
const API_URL = "http://localhost:8000/api/v1/user";

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // API actions
  const fetchUsers = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const res = await axios.get(`${API_URL}/get-user`);
      dispatch({ type: "SET_USERS", payload: res.data.users });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  };

  const createUser = async (userData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const res = await axios.post(`${API_URL}/create-user`, userData);
      dispatch({ type: "ADD_USER", payload: res.data.user });
      return res.data;
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
      throw err;
    }
  };

  const updateUser = async (id, userData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const res = await axios.put(`${API_URL}/up-user/${id}`, userData);
      dispatch({ type: "UPDATE_USER", payload: res.data.user });
      return res.data;
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await axios.delete(`${API_URL}/delete-user/${id}`);
      dispatch({ type: "DELETE_USER", payload: id });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
      throw err;
    }
  };

  // Helper functions for Class component
  const getStudents = () => {
    return state.users.filter(user => user.role === 'student' || !user.role);
  };

  const getUserById = (userId) => {
    return state.users.find(user => user._id === userId);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <UserContext.Provider
      value={{
        ...state,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
        getStudents, // Add this
        getUserById, // Add this
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// ADD THIS HOOK - This is what was missing
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;