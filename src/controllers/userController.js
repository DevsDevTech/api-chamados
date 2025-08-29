import db from "../models/index.cjs";

const User = db.User

export const getUser = async (req, res) => {

  try {
    const userId = req.userId;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role']
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