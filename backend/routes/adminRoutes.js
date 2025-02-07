import express from 'express';
import User from './../models/user.js';
import Role from './../models/role.js';
import Expense from '../models/expense.js';
import { authenticate, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Role }],
    });

    if (!user || user.Role.name !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

router.get('/users', authenticate, adminMiddleware, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [{ model: Role, attributes: ['name'] }],
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.patch('/users/:userId', authenticate, adminMiddleware, async (req, res) => {
  const { userId } = req.params;
  const { roleId } = req.body;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.roleId = roleId;
    await user.save();

    res.json({ message: 'User role updated successfully.', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});


router.delete('/users/:userId', authenticate, adminMiddleware, async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

//gets total users and active users
router.get('/analytics', authenticate, async (req, res) => {
  try {
    const userCount = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });

    res.json({
      totalUsers: userCount,
      activeUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get total number of expenses added
router.get('/total-expenses', authenticate, async (req, res) => {
  try {
    const totalExpenses = await Expense.count();
    res.json({ totalExpenses });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch total expenses', error: err.message });
  }
});

// Get net amount of transactions stored
router.get('/net', authenticate, async (req, res) => {
  try {
    const netAmount = await Expense.sum('amount');
    res.json({ netAmount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch net amount', error: err.message });
  }
});

// Get expense by date
router.get('/by-date', authenticate, async (req, res) => {
  console.log(req.user);

  try {
    const expenses = await Expense.findAll({
      order: [['date', 'DESC']], // Sort by date 
    });

    // Group by date
    const expensesByDate = {};
    expenses.forEach(expense => {
      const dateKey = expense.date.toISOString().split('T')[0]; // Extract YYYY-MM-DD
      if (!expensesByDate[dateKey]) {
        expensesByDate[dateKey] = [];
      }
      expensesByDate[dateKey].push({
        id: expense.id,
        amount: expense.amount,
        type: expense.type,
        description: expense.description,
        category: expense.category,
        paymentMethod: expense.paymentMethod,
        date: expense.date,
      });
    });

    res.json({ expensesByDate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch expenses by date', error: error.message });
  }
});

// Get users data in a formatted way
router.get('/users/all-expenses', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name']
    });

    // Then, get expenses for all users and format the response
    const formattedResponse = await Promise.all(users.map(async (user) => {
      const expenses = await Expense.findAll({
        where: { userId: user.id },
        attributes: ['id', 'amount', 'description', 'category', 'type', 'paymentMethod', 'date'],
        order: [['date', 'DESC']]
      });

      return {
        userId: user.id,
        name: user.name,
        expenses: expenses.map(expense => ({
          id: expense.id,
          amount: expense.amount,
          description: expense.description,
          category: expense.category,
          type: expense.type,
          paymentMethod: expense.paymentMethod,
          date: new Date(expense.date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        }))
      };
    }));

    res.json({"users": formattedResponse});
  } catch (error) {
    console.error('Error fetching all users expenses:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});






export default router;
