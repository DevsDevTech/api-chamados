
import jwt from "jsonwebtoken";
import db from "../src/models/index.cjs";
const User = db.User;


const authorize = (allowedRoles) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const jwt_secret = process.env.JWT_SECRET;

    if (!authHeader) {
      return res.status(401).json({ message: "Token inexistente" });
    }
    const parts = authHeader.split(" ");
    const token = parts[1];

    const isTokenInvalid = await db.InvalidatedToken.findOne({ where: { token }})

    if (isTokenInvalid) {
      return res.status(401).json({ message: "Erro, Faça login novamente" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwt_secret);
    } catch (error) {
      return res.status(401).json({ message: "Token inválido" });
    }

    try {
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(404).json({ message: "Usuário do token não encontrado." });
      }

      req.user = user;
      const userId = req.user.id

      if (allowedRoles.includes(user.role)) {
        next(); 
      } else {
        return res.status(403).json({ message: "Permissões insuficientes." });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
  };
};

export default authorize;

/*
import jwt from "jsonwebtoken";
import db from "../src/models/index.cjs";
const User = db.User;

const authorize = (allowedRoles) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const jwt_secret = process.env.JWT_SECRET;

    if (!authHeader) {
      return res.status(401).json({ message: "Token inexistente" });
    }
    const parts = authHeader.split(" ");
    const token = parts[1];

    let decoded;
    try {
      decoded = jwt.verify(token, jwt_secret);
    } catch (error) {
      return res.status(401).json({ message: "Token inválido" });
    }

    try {
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(404).json({ message: "Usuário do token não encontrado." });
      }

      req.user = user;
      const userId = req.user.id

      if (allowedRoles.includes(user.role)) {
        next(); 
      } else {
        return res.status(403).json({ message: "Permissões insuficientes." });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
  };
};

export default authorize;
*/