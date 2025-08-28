import jwt from "jsonwebtoken";

const jwt_secret = process.env.JWT_SECRET;

const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Pah, acesso negado" });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''));
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }

  next();
};

export default auth;
