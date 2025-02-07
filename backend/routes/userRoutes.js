import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import User from '../models/user.js';

const router = express.Router();

router.get('/test', async(req, res) => {
  res.status(200).json('Api is working');
})

router.get('/me', authenticate, async (req, res) => {
    const user = req.user;
    console.log('user: ', user); 
    const userId = user.id;
    try {
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] } 
        });

        console.log('userDetails: ', user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
