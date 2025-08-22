import { Request, Response, NextFunction } from "express";
import { Usuario } from "../models/usuario";

export const verificarPeriodoPrueba = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).usuario.id;
  const usuario = await Usuario.findByPk(userId);

  if (usuario?.periodo_prueba && usuario.fecha_cobro && usuario.fecha_cobro < new Date()) {
    return res.status(403).json({ message: "Tu periodo de prueba terminó, debes suscribirte" });
  }

  next();
};
export const verificarSuscripcionActiva = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).usuario.id;
  const usuario = await Usuario.findByPk(userId);

  if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

  if (!usuario.fecha_cobro || usuario.fecha_cobro < new Date()) {
    return res.status(403).json({ message: "Tu suscripción no está activa" });
  }

  next();
};
export const verificarPeriodoGracia = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).usuario.id;
  const usuario = await Usuario.findByPk(userId);

  if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

  if (usuario.periodo_gracia) {
    if (usuario.periodo_gracia_expira && usuario.periodo_gracia_expira < new Date()) {
      return res.status(403).json({ message: "Tu periodo de gracia terminó, paga para reactivar tu cuenta" });
    } else {
      return res.status(403).json({ message: "Tu pago falló, estás en periodo de gracia. Actualiza tu tarjeta." });
    }
  }

  next();
};
