import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import session from "express-session";
import passport from "./config/passport.js";
import auth from './routes/auth.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: "*",  
  // origin: "http://localhost:5173",  
  methods: "GET,POST,PUT,DELETE",
  credentials: true, 
}));
app.use(express.json());
app.use(session({ secret: "Secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/auth', auth);
app.use('/api/expenses', expenseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully');
    
    sequelize.sync().then(() => {
      console.log('Database synced');
      app.listen(process.env.PORT || 5000, () => {
        console.log(`Server running on port ${process.env.PORT || 5000}`);
      });
    }).catch((error) => {
      console.error('Error syncing the database:', error);
    });

  })
  .catch((err) => {
    console.log('Database URL:', process.env.DB_URL);
    console.error('Error connecting to the database:', err.message);
  });
