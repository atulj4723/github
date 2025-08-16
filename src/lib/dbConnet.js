import mongoose from "mongoose";

const connection = {};
async function dbConnect() {
    if (connection.isConnected) {
        console.log("Already connected to MongoDB");
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "", {});
        connection.isConnected = db.connections[0].readyState;
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}
export default dbConnect;
