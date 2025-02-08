import express from 'express';
import { Sequelize, Op } from 'sequelize';
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

router.get('/total-expenses', authenticate, async (req, res) => {
  try {
    const totalExpenses = await Expense.count();
    res.json({ totalExpenses });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch total expenses', error: err.message });
  }
});

router.get('/net', authenticate, async (req, res) => {
  try {
    const netAmount = await Expense.sum('amount');
    res.json({ netAmount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch net amount', error: err.message });
  }
});

router.get('/by-date', authenticate, async (req, res) => {

  try {
    const expenses = await Expense.findAll({
      order: [['date', 'DESC']],
    });

    const expensesByDate = {};
    expenses.forEach(expense => {
      const dateKey = expense.date.toISOString().split('T')[0]; 
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

router.get('/by-category', authenticate, async (req, res) => {
  try {
    const expenses = await Expense.findAll();

    const expensesByCategory = {};
    expenses.forEach(expense => {
      const category = expense.category || "Uncategorized"; // Handle undefined categories
      if (!expensesByCategory[category]) {
        expensesByCategory[category] = 0;
      }
      expensesByCategory[category] += 1;
    });

    res.json({ expensesByCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch expenses by category', error: error.message });
  }
});

router.get('/users/all-expenses', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name']
    });

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

router.get('/analytics', authenticate, adminMiddleware, async (req, res) => {
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

router.get('/total-expenses', authenticate, adminMiddleware, async (req, res) => {
  try {
    const totalExpenses = await Expense.count();
    const netAmount = await Expense.sum('amount');

    res.json({ totalExpenses, netAmount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch total expenses', error: err.message });
  }
});

router.get('/income-expense', authenticate, async (req, res) => {
  try {
    const totalIncome = await Expense.sum('amount', { where: { type: 'income' } });
    const totalExpense = await Expense.sum('amount', { where: { type: 'expense' } });

    res.json({ totalIncome: totalIncome || 0, totalExpense: totalExpense || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch income and expenses', error: err.message });
  }
});

router.get('/expense-categories', authenticate, adminMiddleware, async (req, res) => {
  try {
    const expensesByCategory = await Expense.findAll({
      attributes: [
        'category',
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount'],
      ],
      group: ['category'],
      raw: true,
    });

    res.json(expensesByCategory);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch category breakdown', error: err.message });
  }
});

router.get('/active-users-trend', authenticate, adminMiddleware, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const activeUsersTrend = await User.findAll({
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), '%Y-%m'), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'userCount'],
      ],
      where: {
        createdAt: { [Op.gte]: sixMonthsAgo },
      },
      group: ['month'],
      order: [['month', 'ASC']],
      raw: true,
    });

    res.json(activeUsersTrend);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch active users trend', error: err.message });
  }
});

router.get("/top-spenders", authenticate, async (req, res) => {
  try {
    // Aggregate expenses per user
    const topSpenders = await Expense.findAll({
      attributes: [
        "userId",
        [Sequelize.fn("COALESCE", Sequelize.fn("SUM", Sequelize.col("amount")), 0), "totalSpent"], // Handle null values
      ],
      where: { type: "expense" }, // Ensure only expenses are counted
      group: ["userId"],
      order: [[Sequelize.literal('"totalSpent"'), "DESC"]],
      limit: 5,
      raw: true,
    });

    // Fetch user names for the top spenders
    const topSpendersWithNames = await Promise.all(
      topSpenders.map(async (spender) => {
        const user = await User.findByPk(spender.userId, { attributes: ["name"] });
        return { ...spender, name: user ? user.name : "Unknown User" };
      })
    );

    res.json(topSpendersWithNames);
  } catch (err) {
    console.error("Error fetching top spenders:", err);
    res.status(500).json({ message: "Failed to fetch top spenders", error: err.message });
  }
});

router.get('/average-expense', authenticate, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalExpense = await Expense.sum('amount', { where: { type: 'expense' } });

    const avgExpensePerUser = totalUsers ? totalExpense / totalUsers : 0;

    res.json({ avgExpensePerUser });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch average expense per user', error: err.message });
  }
});






export default router;
