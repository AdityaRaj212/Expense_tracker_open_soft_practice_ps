import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

// Route to start Google OAuth
router.get("/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    // Generate JWT token after successful authentication
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Expiration time for the token
    });
  
    // Set the token in an HTTP-only cookie
    res.cookie('authToken', token, {
      httpOnly: true,  // Secure flag should be set based on your environment
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // Cookie expiration time (1 hour)
    });
  
    // Redirect to the dashboard after successful login
    res.redirect('http://localhost:5173');
  });

router.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/");
    });
});
export default router;