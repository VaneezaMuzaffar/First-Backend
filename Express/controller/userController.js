
const User = require('../model/User.js'); // schema import

// ✅ CREATE User
const createUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const newUser = new User({ name, email, phone, password });
    await newUser.save();

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ getUser
const getUser = async (req, res) => {
  try {
     const users = await User.find(); // fetch all users from DB
    res.status(200).json({ message: "User get successfully", users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params; // get user ID from URL params
    const updateData = req.body; // get fields to update from request body

    // Find user by ID and update
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { 
      new: true, // return the updated document
      runValidators: true // ensure schema validation
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params; // get user ID from URL params

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ export function directly
module.exports = {createUser,getUser,updateUser,deleteUser};

// // ✅ READ All Users
// const getUsers = async (req, res) => {
//   try {
//     const users = await User.find();
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // ✅ READ Single User by ID
// const getUserById = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ message: "User not found" });
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // ✅ UPDATE User
// const updateUser = async (req, res) => {
//   try {
//     const { name, email, phone, password } = req.body;
//     const updatedUser = await User.findByIdAndUpdate(
//       req.params.id,
//       { name, email, phone, password },
//       { new: true }
//     );

//     if (!updatedUser) return res.status(404).json({ message: "User not found" });
//     res.json({ message: "User updated", user: updatedUser });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // ✅ DELETE User
// const deleteUser = async (req, res) => {
//   try {
//     const deletedUser = await User.findByIdAndDelete(req.params.id);
//     if (!deletedUser) return res.status(404).json({ message: "User not found" });
//     res.json({ message: "User deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


 