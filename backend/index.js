
// fs modules import here like reading, writing, creating, or deleting files.
const fs = require('fs');
//write file file alwasy create like this code
fs.writeFile('test.js' , "Hello Node js",(err)=>{
if(err){
    console.log(err)
    return
}
})
//read a file

fs.readFile("test.js","utf-8",(err,data)=>{
if(err){
    console.log(err)
    return
}else{
console.log(data)
}
})

// ✅ Append to a file means add more lines in file 
fs.appendFile("test.js", "\nAnother new line added async!", (err) => {
  if (err) {
    console.log("❌ Error appending:", err);
  } else {
    console.log("✅ Line added successfully!");
  }
});

//os (Operating System Module)
//Used to get system-related information (like memory, CPU, hostname, etc.).
const os = require("os");

console.log("Operating System:", os.type());
console.log("OS Platform:", os.platform());
console.log("CPU Architecture:", os.arch());
console.log("Total Memory:", os.totalmem());
console.log("Free Memory:", os.freemem());
console.log("Home Directory:", os.homedir());
console.log("Uptime (seconds):", os.uptime());

//path (Path Module)

//Used to work with file paths easily — very helpful for backend file management.
const path = require("path");

const filePath = "D:/First-Backend/First-Backend/backend/index.js";

console.log("Directory Name:", path.dirname(filePath));
console.log("Base File Name:", path.basename(filePath));
console.log("File Extension:", path.extname(filePath));

// ✅ Join paths safely
const newPath = path.join(__dirname, "folder", "file.txt");
console.log("Joined Path:", newPath);
