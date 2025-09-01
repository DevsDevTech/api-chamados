import db from "../models/index.cjs";

const Comment = db.Comment;
const Ticket = db.Ticket;

export const createComments = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const body = req.body.body;
    const user = req.user;

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket não encontrado." });
    }

    if (user.role === "user" && ticket.createdById !== user.id) {
      return res.status(403).json({ message: "Sem permissão" });
    }

    if (!body) {
      return res
        .status(400)
        .json({ message: "O corpo do comentário é obrigatório." });
    }

    const newComment = await Comment.create({
      ticketId: ticketId,
      authorId: user.id,
      body: body,
    });

    return res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro, tente novamente" });
  }
};

export const listComments = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const ticket = await Ticket.findByPk(ticketId);
    const user = req.user;

    if (!ticket) {
      return res.status(404).json({ message: "Ticket não encontrado." });
    }

    if (user.role === "user" && ticket.createdById !== user.id) {
      return res.status(403).json({ message: "Sem permissão" });
    }

    const comments = await Comment.findAll({ where: { ticketId: ticketId } });
      res.status(200).json({ comments: comments });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro, tente novamente" });
  }
};
