import express from "express";
import {
  createUser,
  loginUser,
  logoutUser,
  deleteUser
} from "./controllers/authController.js";
import { getUser, listUsers } from "./controllers/userController.js";
import {
  createTicket,
  deleteTicket,
  detailTicket,
  listTicket,
  patchTicket,
  updateTicket,
  statusTickets
} from "./controllers/ticketsController.js";
import {
  createComments,
  listComments,
  deleteComment
} from "./controllers/commentsController.js";
import authorize from "../middlewares/authorizate.js";

export const authRoute = express.Router();
export const usersRoute = express.Router();
export const ticketsRoute = express.Router();

// AUTH ROUTES
authRoute.post("/register", authorize(["admin"]), createUser);
authRoute.post("/login", loginUser);
authRoute.post("/logout", authorize(["user", "admin"]), logoutUser);
authRoute.delete("/:id/delete", authorize(["admin"]), deleteUser);

// USERS ROUTES
usersRoute.get("/me", authorize(["user", "admin"]), getUser);
usersRoute.get("/", authorize(["admin"]), listUsers);

// TICKETS ROUTES
ticketsRoute.post("/", authorize(["user", "admin"]), createTicket);
ticketsRoute.get("/", authorize(["user", "admin"]), listTicket);
ticketsRoute.get("/status", authorize(["admin"]), statusTickets);
ticketsRoute.get("/:id", authorize(["user", "admin"]), detailTicket);
ticketsRoute.patch("/:id", authorize(["admin"]), patchTicket);
ticketsRoute.post("/:id/status", authorize(["admin"]), updateTicket);
ticketsRoute.delete("/:id", authorize(["admin"]), deleteTicket);

// COMMENTS ROUTES
ticketsRoute.get("/:ticketId/comments",authorize(["user", "admin"]),listComments);
ticketsRoute.post("/:ticketId/comments",authorize(["user", "admin"]),createComments);
ticketsRoute.delete("/:id/comments",authorize(["user", "admin"]),deleteComment);
