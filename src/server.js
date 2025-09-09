import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { authRoute, usersRoute, ticketsRoute } from "./routes.js";
import cors from 'cors';
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const db = require("./models/index.cjs");

const app = express();
app.use(express.json());
app.use(cors())

app.use("/auth", authRoute);
app.use("/users", usersRoute);
app.use("/tickets", ticketsRoute);

db.sequelize
  .authenticate()
  .then(() => {
    console.log("Banco de dados conectado");
    app.listen(3000, () => console.log("Servidor ok"));
  })
  .catch(() => console.error("Banco de dados não conectado"));
