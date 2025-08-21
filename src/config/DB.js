import mongoose from "mongoose";
import chalk from "chalk";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI_ONLINE)
        console.log(chalk.bgGray(`Connected to MongoDB`))
    } catch (error) {
        console.log(error)
    }
}

export default connectDB;
