import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Sesion } from "../models/session";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token requerido" });
    }

    const token = authHeader.split(" ")[1]!;
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET no está configurada en variables de entorno");
    }

    const decoded = jwt.verify(token, secret) as any;

    // ✅ Ahora jti sí existe porque lo pusimos en el accessToken
    const sessionId = decoded.jti;
    if (!sessionId) {
      return res.status(401).json({ message: "Token sin referencia a sesión" });
    }

    // validar sesión en DB
    const session = await Sesion.findOne({
      where: { id: sessionId, is_revoked: false},
    });
    if (!session) {
      return res.status(401).json({ message: "Sesión expirada o revocada" });
    }

    (req as any).usuario = {
      id: decoded.id,
      correo: decoded.correo,
      rol: decoded.rol,
      sessionId,
    };

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expirado", code: "TOKEN_EXPIRED" });
    }
    console.error(error);
    return res.status(401).json({ message: "Token inválido o no autorizado" });
  }
};
