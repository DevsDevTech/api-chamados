import db from "../models/index.cjs";

const User = db.User;

export const getUser = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findByPk(userId, {
      attributes: ["id", "name", "email", "role"],
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const listUsers = async (req, res) => {
  const userId = req.user.id;
  const user = req.user;

  if (user.role === "admin") {
    try {
      const users = await User.findAll();
      res.status(200).json({ users: users });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro, tente novamente" });
    }
  } else {
    res.status(500).json({ message: "Permissões restritas" });
  }
};
