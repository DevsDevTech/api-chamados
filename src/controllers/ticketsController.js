import db from "../models/index.cjs";

const Ticket = db.Ticket;
const User = db.User;

export const createTicket = async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ message: "O título é obrigatório." });
    }

    const ticketToCreate = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      priority: req.body.priority,
      createdById: req.user.id,
      assigneeId: req.body.assigneeId,
    };

    const newTicket = await Ticket.create(ticketToCreate);
    console.log({ ticketId: req.ticketId });
    res.status(201).json(newTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro, tente novamente" });
  }
};

export const listTicket = async (req, res) => {
  const userId = req.user.id;
  const user = req.user;
  const { page = 1 } = req.query;

  const limit = 10;

  let lastPage = 1;

  const countTicket = await Ticket.count();

  if (countTicket !== 0) {
    lastPage = Math.ceil(countTicket / limit);
  } else {
    return res.status(400).json({ message: "Nenhum ticket encontrado." });
  }

  if (user.role === "user") {
    try {
      const tickets = await Ticket.findAll({
        where: { createdById: userId },
        order: [["created_at", "DESC"]],
        offset: Number(page * limit - limit),
        limit: limit,
      });

      let pagination = {
        path: "/tickets",
        page,
        prev_page_url: page - 1 >= 1 ? page - 1 : null,
        next_page_url: page + 1 > lastPage ? lastPage : page + 1,
        lastPage,
        total: countTicket
      };
      res.status(200).json({ tickets: tickets, pagination: pagination });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro, tente novamente" });
    }
  } else {
    try {
      const tickets = await Ticket.findAll({
        order: [["created_at", "DESC"]],
        offset: Number(page * limit - limit),
        limit: limit,
      });
      let pagination = {
        path: "/tickets",
        page,
        prev_page_url: page - 1 >= 1 ? page - 1 : null,
        next_page_url: Number(page) + Number(1) > lastPage ? null : Number(page) + 1,
        lastPage,
        total: countTicket
      };
      res.status(200).json({ tickets: tickets, pagination: pagination });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro, tente novamente" });
    }
  }
};

export const detailTicket = async (req, res) => {
  const ticketId = req.params.id;
  const ticket = await Ticket.findByPk(ticketId);
  const user = req.user;
  const userId = req.user.id;

  if (user.role === "admin" || ticket.createdById === userId) {
    try {
      const dataToUpdate = req.body;
      const ticket = await Ticket.findByPk(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket não encontrado." });
      }

      await ticket.update(dataToUpdate);

      return res.status(200).json(ticket.toJSON());
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
  } else {
    return res.status(500).json({ message: "Tente novamente" });
  }
};

export const patchTicket = async (req, res) => {
  const ticketId = req.params.id;
  const data = req.body;

  try {
    const ticket = await Ticket.findByPk(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket não encontrado." });
    }

    await ticket.update(data);
    return res.status(200).json(ticket);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const updateTicket = async (req, res) => {
  const ticketId = req.params.id;
  const data = req.body;

  try {
    const ticket = await Ticket.findByPk(ticketId);
    console.log({ data: data });

    await ticket.update(data);
    return res.status(200).json(ticket);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const deleteTicket = async (req, res) => {
  const ticketId = req.params.id;
  console.log(
    `[DELETE] Recebida requisição para deletar ticket ID: ${ticketId}`
  );

  try {
    const deletedTicket = await Ticket.destroy({
      where: {
        id: ticketId,
      },
    });

    res.status(200).json({ message: "Ticket deletado!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};
