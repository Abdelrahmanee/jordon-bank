
import express from 'express'

import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { AppError } from './utilies/error.js'
import v1_router from './routes/v1.routes.js'

dotenv.config()
export const bootstrap = (app) => {



    app.enable('trust proxy')
    app.set('trust proxy', true);



    app.use(express.json())


    const allowedOrigins = ['http://localhost:5173', 'https://jordon-bank.vercel.app'];

    const corsOptions = {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    };
    
    app.use(cors(corsOptions));

    app.use(morgan('dev'))

    app.get('/', (req, res) => {
        res.status(200).json({ message: 'Welcome to the API' });
    });
    app.use('/api/v1', v1_router)




    app.all('*', (req, res, next) => {
        throw new AppError('Route not found', 404)
    })


    app.use((err, req, res, next) => {
        err.statusCode = err.statusCode || 500;
        err.status = err.status || 'error';
        err.stack = err.stack;

        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            ...(process.env.MODE === 'devlopment' && { stack: err.stack })
        });
    });

}