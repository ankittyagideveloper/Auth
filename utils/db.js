import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const db = async () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("Database connected successfully!!"))
    .catch((err) => console.error("connection failed"));
};

export default db;
