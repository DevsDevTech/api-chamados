import db from "../models/index.cjs";

const Comment = db.Comment;
const Ticket = db.Ticket;
const File = db.File;
const User = db.User;

export const createComments = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const body = req.body.body;
    const user = req.user;
    const { files } = req.body;

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket não encontrado." });
    }

    if (user.role === "user" && ticket.createdById !== user.id) {
      return res.status(403).json({ message: "Sem permissão" });
    }

    if (files && files.length > 3) {
      return res
        .status(400)
        .json({ message: "É permitido apenas 3 fotos por ticket" });
    }

    if (!body) {
      return res
        .status(400)
        .json({ message: "O corpo do comentário é obrigatório." });
    }

    const newComment = await Comment.create({
      ticketId: ticketId,
      authorId: user.id,
      files: files,
      body: body,
    });

    if (files && Array.isArray(files) && files.length > 0) {
      const filesToCreate = files.map((file) => ({
        ...file,
        commentId: newComment.id,
        userId: user.id,
      }));

      await File.bulkCreate(filesToCreate);
    }

    const finalComment = await Comment.findByPk(newComment.id, {
      include: ["files"],
    });

    return res.status(201).json(finalComment);
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

    const comments = await Comment.findAll({
      where: { ticketId: ticketId },
      include: {
        model: User,
        as: "author",
        attributes: ["name", "id"],
      },
      order: [["created_at", "ASC"]]
    });
    res.status(200).json({ comments: comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro, tente novamente" });
  }
};

export const deleteComment = async (req, res) => {
  const commentId = req.params.id
  console.log(
    `[DELETE] Recebida requisição para deletar o usuário: ${commentId}`
  );

  try {
    const deletedId = await Comment.destroy({
      where: {
        id: commentId,
      },
    });

    res.status(200).json({ message: "Comentário deletado!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}
