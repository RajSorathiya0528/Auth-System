import express from 'express';
import { registerUser, loginUser, varifyUser, getMe, resetPassword, logoutUser, forgotPassword } from '../Controller/User.controller.js'
import { isLogin } from '../Middelwar/auth.middelwar.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/varify/:token', varifyUser);
router.get('/getme', isLogin, getMe);
router.get('/logout', isLogin, logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router

