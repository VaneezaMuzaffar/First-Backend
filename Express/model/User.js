const mongoose =require('mongoose')
// Define schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
   password: {
    type: String,
    required: true,
    minlength: 6, // optional: make sure password has at least 6 chars
  },
});

// Create model
const User = mongoose.model("User", userSchema);

// Export model
module.exports  =User
