import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/user.js';
import axios from 'axios';
import passport from "../config/passport.js";

const router = express.Router();
const OTP_MAP = new Map(); // Temporary OTP store

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.verification_email, 
    pass: process.env.app_password, 
  },
});

router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  OTP_MAP.set(email, otp);

  const mailOptions = {
    from: email,
    to: "webdev.by.adi@gmail.com",
    subject: "Admin Registration OTP",
    text: `OTP for ${email}: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP sent to super admin" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password, role, otp } = req.body;

  if (role === "admin" && OTP_MAP.get(email) !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, roleId: role === "admin" ? 1 : 2 });
    res.status(201).json({ success: true, message: "User registered successfully", user });
  } catch (err) {
    res.status(400).json({ success: false, message: "Registration failed", error: err.message });
  } finally {
    OTP_MAP.delete(email);
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('yo')
    const user = await User.findOne({ where: { email } });
    console.log('user: ', user);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: true, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed', error: err.message });
  }
});

router.post('/google-login', async (req, res) => {
  const { token } = req.body;
  

  try {
      // Verify the token with Google's OAuth API
      const googleUser = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`);
      
      const { sub: googleId, email, name } = googleUser.data;
      
      let user = await User.findOne({ where: { googleId } });
      
      if (!user) {
          user = await User.create({
              googleId,
              name,
              email,
              password: "GooglePassword", // No password for OAuth users
          });
      }

      // Create a JWT token for the authenticated user
      const jwtToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: '1h',
      });

      res.json({ token: jwtToken, user });
  } catch (error) {
      console.error('Google login error:', error);
      res.status(500).json({ message: 'Something went wrong with Google login' });
  }
});




export default router;
