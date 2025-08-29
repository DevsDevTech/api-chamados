import db from "../models/index.cjs";

const Comment = db.Comment;

export const createComments = async (req, res) => {
  const userId = req.userId;
  const ticketId = req.params.ticketId;

  try {

    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }
    if (!req.body.body) {
      return res.status(400).json({ message: "O comentário é obrigatória." });
    }

    const newComment = await Comment.create({
      ticketId: ticketId,
      authorId: userId,
      body: req.body.body
    });

    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro, tente novamente" });
  }
};

export const listComments = async (req, res) => {
  const ticketId = req.params.ticketId;

  try {
    const comments = await Comment.findOne({ where: { ticketId: ticketId } });
    res.status(200).json({ comments: comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro, tente novamente" });
  }
};
 