import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

const connectToDb = () => {
    mongoose.connect(process.env.DB_CONNECTION)
        .then(() => { console.log("db is connected") })
        .catch((error) => { console.error(error) })
}
export { connectToDb }