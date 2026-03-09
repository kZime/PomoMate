import express from "express";
import mongoose from "mongoose";
import { MONGO_URI, hasCustomEnvValue } from "../config/env.js";

const router = express.Router();

let databaseConnection = "Waiting for Database response...";

router.get("/", (req, res) => {
    res.send(databaseConnection);
});

if (!hasCustomEnvValue("MONGO_URI")) {
    console.warn(`MONGO_URI is empty. Falling back to default: ${MONGO_URI}`);
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("Connected to Database!");
        databaseConnection = "Connected to Database";
    })
    .catch((error) => {
        console.error("Database connection error:", error);
        databaseConnection = "Error connecting to Database";
    });

export default router;
