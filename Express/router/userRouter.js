const express = require('express');
const { createUser, getUser, updateUser, deleteUser } = require('../controller/userController.js');

const router = express.Router();

// Routes
router.post('/create-user', createUser);
router.get('/get-user', getUser);
router.put('/up-user/:id', updateUser);
router.delete('/delete-user/:id', deleteUser); // better to use DELETE method


module.exports = router;
