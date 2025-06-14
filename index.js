import express from 'express'
import dotenv from 'dotenv'
import { connectToDB } from './db/db.connect.js';
import {bootstrap} from './src/bootstrap.js'

dotenv.config()

const PORT = +process.env.PORT || 3000;

const app = express()




bootstrap(app)

await connectToDB()

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})