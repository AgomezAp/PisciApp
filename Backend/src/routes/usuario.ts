import { Router } from "express";
import {
  solicitarRecuperacion,
  resetearContraseña,
  activar2FA,
  verificar2FALogin,
} from "../controllers/usuario";
import { verifyToken } from "../middlewares/verifyToken"; 

const router = Router();

// Recuperar contraseña
router.post("/forgot-password", solicitarRecuperacion);
router.post("/reset-password/:token", resetearContraseña);

// 2FA
router.post("/2fa/enable", verifyToken, activar2FA);
router.post("/2fa/verify", verificar2FALogin);

export default router;