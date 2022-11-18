const express = require('express');
const { logout, register, login, getMe , forgotPassword, updateDetails,updatePassword,resetPassword } = require('../controllers/auth.controller');

const router = express.Router();
// Other resourses
let { protect  } = require('../middlewares/auth');


router
.get('/logout',logout)
.put('/resetpassword/:resettoken',resetPassword)
.post('/register', register)
.get('/login', login)
.put('/updatedetails',protect,updateDetails)
.put('/updatepassword',protect,updatePassword)
.get('/me', protect, getMe)
.post('/forgotpassword',forgotPassword);
module.exports = { router: router };