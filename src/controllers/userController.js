import db from "../models/index.cjs";
import bcrypt from "bcrypt";

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

  try {
    const users = await User.findAll();
    res.status(200).json({ users: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro, tente novamente" });
  }
};

export const editUser = async (req, res) => {
  const userId = req.params.id;
  const { email, password } = req.body;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const dataToUpdate = {};

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email: email } });
      if (emailExists && emailExists.id !== userId) {
        return res.status(409).json({ message: "Este e-mail já está em uso." });
      }
      dataToUpdate.email = email;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.passwordHash = await bcrypt.hash(password, salt);
    }

    if (Object.keys(dataToUpdate).length > 0) {
      await user.update(dataToUpdate);
    }
    
    const { passwordHash, ...userResponse } = user.get({ plain: true });

    return res.status(200).json({ 
      message: "Usuário atualizado com sucesso!", 
      user: userResponse 
    });

  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};
