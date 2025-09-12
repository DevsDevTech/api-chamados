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
  statusTickets,
  countTickets,
  closedTickets,
  filteredTickets
} from "./controllers/ticketsController.js";
import {
  createComments,
  listComments,
  deleteComment
} from "./controllers/commentsController.js";
import { getTicketsPhotos } from "./controllers/filesController.js";
import authorize from "../middlewares/authorizate.js";
import multer from 'multer';

export const authRoute = express.Router();
export const usersRoute = express.Router();
export const ticketsRoute = express.Router();
export const filesRoute = express.Router();

const upload = multer({
  storage: multer.memoryStorage(), 
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
    }
  }
});

// AUTH ROUTES
authRoute.post("/register", authorize(["admin"]), createUser);
authRoute.post("/login", loginUser);
authRoute.post("/logout", authorize(["user", "admin"]), logoutUser);
authRoute.delete("/:id/delete", authorize(["admin"]), deleteUser);

// USERS ROUTES
usersRoute.get("/me", authorize(["user", "admin"]), getUser);
usersRoute.get("/", authorize(["user", "admin"]), listUsers);

// TICKETS ROUTES
ticketsRoute.post("/", authorize(["user", "admin"]), upload.array('files', 3), createTicket);
ticketsRoute.get("/", authorize(["user", "admin"]), listTicket);
ticketsRoute.get("/closed", authorize(["admin"]), closedTickets);
ticketsRoute.get("/filtered", authorize(["user", "admin"]), filteredTickets)
ticketsRoute.get("/status", authorize(["admin"]), statusTickets);
ticketsRoute.get("/:id", authorize(["user", "admin"]), detailTicket);
ticketsRoute.patch("/:id", authorize(["admin"]), patchTicket);
ticketsRoute.post("/:id/status", authorize(["admin"]), updateTicket);
ticketsRoute.delete("/:id", authorize(["admin"]), deleteTicket);
ticketsRoute.get("/:id/count", authorize(["admin"]), countTickets);


// COMMENTS ROUTES
ticketsRoute.get("/:ticketId/comments",authorize(["user", "admin"]),listComments);
ticketsRoute.post("/:ticketId/comments",authorize(["user", "admin"]),createComments);
ticketsRoute.delete("/:id/comments",authorize(["admin"]),deleteComment);

// FILES ROUTES
filesRoute.get("/:ticketId", authorize(["user", "admin"]), getTicketsPhotos);
