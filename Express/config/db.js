const mongoose =require('mongoose')

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://vaneeza:nain7890@cluster0.gm5al2c.mongodb.net/");
    console.log("✅ MongoDB connected successfully!",mongoose.connection.host);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
  }
};

module.exports=connectDB
