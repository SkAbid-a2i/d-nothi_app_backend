const express = require('express');
   const dotenv = require('dotenv');
   const cors = require('cors');
   const cookieParser = require('cookie-parser');
   const errorHandler = require('./middleware/errorMiddleware');
   const adminRoutes = require('./routes/adminRoutes');
   const authRoutes = require('./routes/authRoutes');
   const userRoutes = require('./routes/userRoutes');
   const taskRoutes = require('./routes/taskRoutes');
   const leaveRoutes = require('./routes/leaveRoutes');

   dotenv.config();

   const app = express();

   // Middleware
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
     credentials: true
   }));
   app.use(express.json());
   app.use(express.urlencoded({ extended: true }));
   app.use(cookieParser());

   // Routes
   app.use('/api/admin', adminRoutes);
   app.use('/api/auth', authRoutes);
   app.use('/api/users', userRoutes);
   app.use('/api/tasks', taskRoutes);
   app.use('/api/leaves', leaveRoutes);

   // Error Handler
   app.use(errorHandler);

   module.exports = app;