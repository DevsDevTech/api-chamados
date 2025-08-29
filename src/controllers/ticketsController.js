import db from "../models/index.cjs";

const Ticket = db.Ticket;

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
      createdById: req.userId,
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

  try {
    const tickets = await Ticket.findAll();
    res.status(200).json({ tickets: tickets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro, tente novamente" });
  }
};


export const detailTicket = async (req, res) => {
  const ticketId = req.params.id;

  try {
    const dataToUpdate = req.body;
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket não encontrado." });
    }

    await ticket.update(dataToUpdate);

    return res.status(200).json(ticket);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
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
