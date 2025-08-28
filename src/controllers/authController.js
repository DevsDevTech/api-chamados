import { createRequire } from "module";
const require = createRequire(import.meta.url);
const db = require("../models/index.cjs");
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const User = db.User;

export const createUser = async (req, res) => {
  try {
    if (!req.body.passwordHash) {
      return res.status(400).json({ message: "A senha é obrigatória." });
    }
    if (!req.body.email) {
      return res.status(400).json({ message: "O email é obrigatório." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.passwordHash, salt);

    const userToCreate = {
      name: req.body.name,
      email: req.body.email,
      passwordHash: hashPassword,
      role: req.body.role,
    };
    const newUser = await User.create(userToCreate);

    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro, tente novamente" });
  }
};

export const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    const jwt_secret = process.env.JWT_SECRET

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

    const token = jwt.sign({id: user.id}, jwt_secret, {expiresIn: '1h'})

    return res
      .status(200)
      .json(token);

  } catch (err) {
    console.error(err);

    res.status(500).json({ message: "Erro, tente novamente" });
  }
};
