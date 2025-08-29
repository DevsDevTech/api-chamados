import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const jwt_secret = process.env.JWT_SECRET;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  const parts = authHeader.split(" ");

  const [scheme, token] = parts;

  try {
    const decoded = jwt.verify(token, jwt_secret);
    
    req.userId = decoded.id;
    return next();
  } catch (error) {

    return res.status(401).json({ message: "Token inválido" });
  }

  next();
};

export default auth;
