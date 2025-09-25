import { Resend } from "resend";
import db from "../models/index.cjs";
import bcrypt from "bcrypt";
import admin from "firebase-admin";
import { randomInt } from "crypto";

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
      user: userResponse,
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const editPassUser = async (req, res) => {
  try {
    const { email } = req.body;
    const isAvailable = false;
    const code = randomInt(0, 1000000).toString().padStart(6, "0");

    const resend = new Resend(process.env.RESEND_API_KEY);

    if (!email) {
      return res.status(400).json({ message: "O e-mail é obrigatório." });
    }

    resend.emails.send({
      from: "ale.pereira0422@gmail.com",
      to: email,
      subject: "Redefinir senha",
      html: `<p>Seu código: <strong>${code}</strong>!</p>`,
    });

    return res.status(200).json({ code });
  } catch (error) {
    console.log("ERRO AO EDITAR SENHA", error);
    return res.status(500).json({ message: "Erro, ao editar senha" });
  }
};

export const findUserByEmail = async (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({ message: "O e-mail é obrigatório." });
  }
  try {
    console.log(`Buscando usuário com o e-mail: ${email}`);

    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      console.log(
        `Tentativa de redefinição para e-mail não cadastrado: ${email}`
      );
      return res.status(200).json({
        message:
          "Se uma conta com este e-mail existir, um link para redefinição de senha foi enviado.",
      });
    }
    console.log(`Usuário encontrado para redefinição de senha. ID: ${user.id}`);

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Erro no processo de 'esqueci a senha':", error);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro, por favor tente novamente." });
  }
};

export const verifyPostgresToken = async (req, res) => {
  const uid = req.user.dataValues.id;
  const role = req.user.dataValues.role;

  console.log("TESTEE", uid, role)

  if (!uid || !role) {
    return res
      .status(400)
      .json({ message: "Dados do usuário (ID e Role) inválidos." });
  }

  if (!uid || typeof uid !== "string" || uid.length === 0 || uid.length > 128) {
    console.error(
      "ERRO CRÍTICO: O UID é inválido! Abortando a criação do token."
    );
    return res
      .status(500)
      .json({ message: "UID do usuário inválido no backend." });
  }

  if (!uid) {
    return res.status(400).json({ message: "ID do usuário não encontrado." });
  }
  try {
    const firebaseToken = await admin
      .auth()
      .createCustomToken(uid, { role: role });

    res.status(200).json({ firebaseToken });
  } catch (error) {
    console.error("Erro ao gerar token customizado do Firebase:", error);
    res.status(500).json({
      message: "Não foi possível obter a autorização para o storage.",
    });
  }
};
