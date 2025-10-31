import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { serve } from "inngest/express";
import userRoutes from "./routes/user.js";
import ticketRoutes from "./routes/ticket.js";
import { inngest } from "./inngest/client.js";
import { onUserSignup } from "./inngest/functions/on-signup.js";
import { onTicketCreated } from "./inngest/functions/on-ticket-create.js";

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

// --- Configuration ---
const PRIMARY_MONGO_URI = process.env.MONGO_URI;
const LOCAL_MONGO_URI = "mongodb://localhost:27017/your_ticket_db_name";

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }));
app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/tickets", ticketRoutes);

app.use(
  "/api/inngest/",
  serve({
    client: inngest,
    functions: [onUserSignup, onTicketCreated],
  })
);

// --- Connection and Server Start Function ---

const startServer = (uri) => {
    mongoose
        .connect(uri)
        .then(() => {
            console.log(`Mongo DB is connected using URI: ${uri.substring(0, uri.indexOf('@') > 0 ? uri.indexOf('@') : uri.length).slice(0, 30)}... ✅`);
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT} 🚀`);
            });
        })
        .catch((err) => {
            console.error("⚠️MongoDB connection failed on final attempt:", err.message);
            // If the final attempt (local) fails, exit the process.
            process.exit(1); 
        });
};

const connectWithFallback = async () => {
    try {
        // 1. Attempt PRIMARY Connection (e.g., MongoDB Atlas - prone to internet failure)
        await mongoose.connect(PRIMARY_MONGO_URI);
        console.log("MongoDB connected to PRIMARY URI. (Cloud) ✅");
        
    } catch (primaryErr) {
        console.warn(`⚠️ PRIMARY MongoDB connection failed. Attempting local fallback...`);
        console.error(`Reason: ${primaryErr.message}`);
        
        // 2. Attempt LOCAL Fallback Connection
        try {
            await mongoose.connect(LOCAL_MONGO_URI);
            console.log("MongoDB connected to LOCAL URI. (Offline Mode) 💾");

        } catch (localErr) {
            console.error("❌ MongoDB connection failed on LOCAL fallback. Cannot start server.");
            console.error(`Local Reason: ${localErr.message}`);
            process.exit(1);
        }
    }
    
    // Server starts only after a successful connection (either primary or fallback)
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} 🚀`);
    });
};

// Execute the connection sequence
connectWithFallback();
