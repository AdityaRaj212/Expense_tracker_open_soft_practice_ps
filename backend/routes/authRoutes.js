import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/user.js';

const router = express.Router();
const OTP_MAP = new Map(); // Temporary OTP store

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "webdev.by.adi@gmail.com", // Your email
    pass: "trbz xzrx inww cous", // Your app password
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

export default router;
