import { createRequire } from "module";
const require = createRequire(import.meta.url);
const db = require("../models/index.cjs");
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";

const InvalidatedToken = db.InvalidatedToken;
const User = db.User;

export const createUser = async (req, res) => {
  const passwordHash = nanoid(8);

  try {
    if (!req.body.email) {
      return res.status(400).json({ message: "O email é obrigatório." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(passwordHash, salt);

    const userToCreate = {
      name: req.body.name,
      email: req.body.email,
      passwordHash: hashPassword,
    };

    const newUser = await User.create(userToCreate);

    res.status(201).json({ user: newUser, senha: passwordHash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro, tente novamente" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const jwt_secret = process.env.JWT_SECRET;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email e senha são obrigatórios." });
    }

    const user = await User.findOne({
      where: { email: email },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const isPassValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPassValid) {
      return res.status(401).json({ message: "Senha errada." });
    }

    const token = jwt.sign({ id: user.id }, jwt_secret, { expiresIn: "1h" });

    return res.status(200).json({ "id": user.id,
  "name": user.name,
  "email": user.email,
  "role": "user",
  "token": token });
  } catch (err) {
    console.error(err);

    res.status(500).json({ message: "Erro, tente novamente" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(400).json({ message: "Token inexistente" });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
        return res.status(400).json({ message: "Token inválido." });
    }
    
    const expiresAt = new Date(decoded.exp * 1000);

    const tokenExists = await InvalidatedToken.findOne({ where: { token } });
    if (tokenExists) {
        return res.status(200).json({ message: "Logout feito anteriormente" });
    }

    await InvalidatedToken.create({ token, expiresAt });

    return res.status(200).json({ message: "Logout realizado" });

  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};
