import db from "../models/index.cjs";
import { bucket } from '../server.js'; 
import { Op } from "sequelize";

const Ticket = db.Ticket;
const File = db.File;
const User = db.User;

export const createTicket = async (req, res) => {
  try {
    const { files } = req.body;
    const user = req.user;
    console.log("Conteúdo de req.files:", req.files);
    console.log("Conteúdo de req.body:", req.body);

    if (!req.body.title) {
      return res.status(400).json({ message: "O título é obrigatório." });
    }

    if (files && files.length > 3) {
      return res
        .status(400)
        .json({ message: "É permitido apenas 3 fotos por ticket" });
    }

    const newTicket = {
      id: req.body.id,
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      priority: req.body.priority,
      createdById: req.user.id,
      assigneeId: req.body.assigneeId,
    };

    if (
      newTicket.priority !== "low" &&
      newTicket.priority !== "medium" &&
      newTicket.priority !== "high"
    ) {
      return res.status(400).json({ message: "Tente uma prioridade válida" });
    }

    const createdTicket = await Ticket.create(newTicket);
    console.log("Ticket criado com ID:", createdTicket.id);
    const uploadedFileUrls = [];

    if (req.files && req.files.length > 0) {
      console.log(`Iniciando upload para ${req.files.length} arquivo(s).`)
      for (const file of req.files) {
        console.log("Processando arquivo:", file.originalname)
        const fileExtension = file.originalname.split(".").pop();
        const fileNameInStorage = `tickets/${
          createdTicket.id
        }/${v4()}.${fileExtension}`;
        const fileRef = bucket.file(fileNameInStorage);

        await new Promise((resolve, reject) => {
          const stream = fileRef.createWriteStream({
            metadata: {
              contentType: file.mimetype,
            },
          });

          stream.on("error", (err) => {
            console.error(
              "Erro no stream de upload para o Firebase Storage:",
              err
            );
            reject(err);
          });

          stream.on("finish", async () => {
             console.log("Stream de upload finalizado para:", file.originalname)
            await fileRef.makePublic();
            const publicUrl = fileRef.publicUrl();
            uploadedFileUrls.push(publicUrl);

            await File.create({
              name: file.originalname,
              url: publicUrl,
              ticketId: createdTicket.id,
              userId: user.id
            });
            resolve();
          });

          stream.end(file.buffer);
        });
      }
    }

    const finalTicket = await Ticket.findByPk(createdTicket.id, {
      include: ["files"],
    });

    return res.status(201).json(finalTicket);
  } catch (err) {
    console.error("ERRO ao criar ticket:", err);
    res.status(500).json({ message: "Erro, tente novamente" });
  }
};

export const listTicket = async (req, res) => {
  const userId = req.user.id;
  const user = req.user;
  const { page = 1 } = req.query;

  const limit = 30;

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
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["name", "email"],
          },
        ],
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
        total: countTicket,
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
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["name", "email"],
          },
        ],
        where: {
          status: {
            [Op.in]: ["aberto", "em_andamento"],
          },
        },
        offset: Number(page * limit - limit),
        limit: limit,
      });
      let pagination = {
        path: "/tickets",
        page,
        prev_page_url: page - 1 >= 1 ? page - 1 : null,
        next_page_url:
          Number(page) + Number(1) > lastPage ? null : Number(page) + 1,
        lastPage,
        total: countTicket,
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

    await ticket.update(data, {
      fields: ["title", "description", "priority", "status"],
    });
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

    if (
      ticket.status !== "aberto" &&
      ticket.status.trim() !== "em_andamento" &&
      ticket.status !== "fechado"
    ) {
      res.status(400).json({ message: "Atualize para um status válido" });
    }

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

export const statusTickets = async (req, res) => {
  const { page = 1 } = req.query;

  const limit = 15;

  let lastPage = 1;

  const countTicket = await Ticket.count();

  if (countTicket !== 0) {
    lastPage = Math.ceil(countTicket / limit);
  } else {
    return res.status(400).json({ message: "Nenhum ticket encontrado." });
  }

  try {
    const tickets = await Ticket.findAll({
      order: [["created_at", "DESC"]],
      offset: Number(page * limit - limit),
      limit: limit,
    });

    const statusTickets = tickets.map((ticket) => {
      return {
        id: ticket.id,
        status: ticket.status,
        created_at: ticket.created_at,
      };
    });

    let pagination = {
      path: "/tickets",
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url:
        Number(page) + Number(1) > lastPage ? null : Number(page) + 1,
      lastPage,
      total: countTicket,
    };
    res.status(200).json({ tickets: statusTickets, pagination: pagination });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro, tente novamente" });
  }
};

export const countTickets = async (req, res) => {
  try {
    const userId = req.params.id;

    const tickets = await Ticket.findAll({
      where: { createdById: userId },
    });

    res.status(200).json({ tickets: tickets });
  } catch (error) {
    res.status(500).json({ message: "Erro, tente novamente" });
  }
};

export const closedTickets = async (req, res) => {
  const userId = req.user.id;
  const user = req.user;
  const { page = 1 } = req.query;

  const limit = 30;

  let lastPage = 1;

  const countTicket = await Ticket.count();

  if (countTicket !== 0) {
    lastPage = Math.ceil(countTicket / limit);
  } else {
    return res.status(400).json({ message: "Nenhum ticket encontrado." });
  }

  try {
    const tickets = await Ticket.findAll({
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["name", "email"],
        },
      ],
      where: { status: "fechado" },
      offset: Number(page * limit - limit),
      limit: limit,
    });
    let pagination = {
      path: "/tickets",
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url:
        Number(page) + Number(1) > lastPage ? null : Number(page) + 1,
      lastPage,
      total: countTicket,
    };
    res.status(200).json({ tickets: tickets, pagination: pagination });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro, tente novamente" });
  }
};

export const filteredTickets = async (req, res) => {
  const { id: userId, role } = req.user;

  const { page = 1, limit = 30, selectedId, status, priority } = req.query;

  const whereClause = {};

  if (role === "user") {
    whereClause.createdById = userId;
  } else if (selectedId) {
    whereClause.createdById = selectedId;
  }

  if (status) {
    whereClause.status = status;
  }
  if (priority) {
    whereClause.priority = priority;
  }

  try {
    const { count, rows: tickets } = await Ticket.findAndCountAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["name", "email"],
        },
      ],
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    });

    const lastPage = Math.ceil(count / limit) || 1;
    const pagination = {
      path: "/tickets",
      page: parseInt(page, 10),
      prev_page_url:
        parseInt(page, 10) > 1
          ? `/tickets?page=${parseInt(page, 10) - 1}`
          : null,
      next_page_url:
        parseInt(page, 10) < lastPage
          ? `/tickets?page=${parseInt(page, 10) + 1}`
          : null,
      total: count,
      lastPage,
    };

    res.status(200).json({ tickets: tickets, pagination: pagination });
  } catch (err) {
    console.error("Erro ao buscar tickets:", err);
    res.status(500).json({ message: "Erro, tente novamente" });
  }
};
