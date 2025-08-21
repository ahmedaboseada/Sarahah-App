import mongoose from "mongoose";
import chalk from "chalk";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        // add atlas url - config engine at package.json
        // add app on github
        console.log(chalk.bgGray(`Connected to MongoDB ${process.env.MONGO_URI}`))
    } catch (error) {
        console.log(error)
    }
}

export default connectDB;
