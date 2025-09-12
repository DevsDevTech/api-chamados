import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { authRoute, usersRoute, ticketsRoute, filesRoute } from "./routes.js";
import cors from 'cors';
import { createRequire } from "module";
import admin from 'firebase-admin';
const require = createRequire(import.meta.url);

const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET_URL 
});

export const bucket = admin.storage().bucket();
const db = require("./models/index.cjs");

const app = express();
app.use(express.json());
app.use(cors())

app.use("/auth", authRoute);
app.use("/users", usersRoute);
app.use("/tickets", ticketsRoute);
app.use("/files", filesRoute);

db.sequelize
  .authenticate()
  .then(() => {
    console.log("Banco de dados conectado");
    app.listen(3000, () => console.log("Servidor ok"));
  })
  .catch(() => console.error("Banco de dados não conectado"));
