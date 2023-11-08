import express from "express";
import colors from "colors";
import dotenv from "dotenv";
//import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import mongoose from "mongoose";
import ideaRoutes from "./routes/ideaRoutes.js";
import restify from "restify";
import xss from "xss-clean";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cron from "node-cron";
import axios from "axios";
import cors from "cors";

// var admin = require("firebase-admin");
import admin from "firebase-admin";

import serviceAccount from "./dalda-22470-firebase-adminsdk-4ojre-a7cef612d4.json" assert { type: "json" };
import userModel from "./models/userModel.js";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

//configure env
dotenv.config();

//databse config
//connectDB();
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("Dbconnection sucessfull"))
    .catch((err) => {
        console.log(err);
    });

//rest object
const app = express();

app.use(cors());
app.use(helmet());

const limit = rateLimit({
    max: 100, // max requests
    windowMs: 60 * 60 * 1000, // 1 Hour of 'ban' / lockout
    message: "Too many requests", // message to send
});
//middelwares
app.use(express.json({ limit: "10kb" }));

//routes

app.use("/api/auth", authRoutes, limit);
app.use("/api/ideas", ideaRoutes, limit);
app.use(mongoSanitize());
app.use(xss());
const response = app.get("/", (req, res) => {
    res.send("<h1>Welcome</h1>");
});

app.post("/join", async (req, res) => {
    try {
        console.log(req.body);
        // await admin.messaging().subscribeToTopic(req.body.token, req.body.name)
    } catch (error) {
        console.log(error);
    }
});

const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24,
};

app.post("/firebase/notification", async (req, res) => {

    // const user = await userModel.findById(req.body.userId);
    // const firstLineManager = await userModel.findOne({ userid: user.firstLineManager });
    // const secondLineManager = await userModel.findOne({ userid: user.secondLineManager });
    // const lineDirector = await userModel.findOne({ userid: user.lineDirector });

    // const message = {
    //     notification: {
    //         title: req.body.title,
    //         body: req.body.body,
    //     },
    //     token: [firstLineManager.token, secondLineManager.token, lineDirector.token]
    // }


    admin.messaging().send(message).then((response) => {
        // Response is a message ID string.
        console.log("Successfully sent message:", response);
    }
    ).catch((error) => {
        console.log("Error sending message:", error);
    });
});
//cron job

const registerUser = async (userData) => {
    try {
        const response = await axios.post(
            "http://192.168.0.107:8080/api/auth/register",
            userData
        );
        console.log(response.data);
    } catch (error) {
        console.error("Error registering user:", error.response.data);
    }
};

cron.schedule("0 8 */3 * *", async () => {
    // console.log("hello")
    try {
        const response = await axios.get(
            "http://mobileapp.daldafoods.com:801/api/Employees/GetDFLEmployeesDetails",
            {
                headers: {
                    "x-api-key": "5220BD17194746D2BEAB7F3682E50C92",
                },
            }
        );

        const dbArray = await axios.get(
            "http://192.168.0.107:8080/api/auth/get-users"
        );
        const dbIds = dbArray.data.users.map((db) => db.userid);
        const users = response.data.filter(
            (item) => !dbIds.includes(parseInt(item.USERID))
        );
        console.log(users);

        for (const user of users) {
            const userData = {
                userid: user.USERID,
                username: user.USERNAME,
                password: user.PASSWORD,
                designation: user.DESIGNATION,
                department: user.DEPARTMENT,
                firstLineManager: user.FIRSTLINEMANAGER,
                secondLineManager: user.SECONDLINEMANAGER,
                lineDirector: user.LINEDIRECTOR,
            };

            await registerUser(userData);
        }
    } catch (error) {
        console.error("Error fetching data:", error.response.data);
    }
});

//PORT
const PORT = process.env.PORT || 75;

//run listen
app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`.bgCyan.white);
});
