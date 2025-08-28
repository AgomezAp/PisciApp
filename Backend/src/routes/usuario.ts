import { Router } from "express";
import {
  solicitarRecuperacion,
  resetearcontraseña,
  activar2FA,
  verificar2FALogin,
  desactivar2FA,
  confirmar2FA,
} from "../controllers/usuario";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

// Recuperar contraseña
router.post("/forgot-password", solicitarRecuperacion);
router.post("/reset-password/:token", resetearcontraseña);

// 2FA
router.post("/auth/2fa/activar", verifyToken, activar2FA);
router.post("/auth/2fa/confirmar", verifyToken, confirmar2FA);
router.post("/auth/2fa/desactivar", verifyToken, desactivar2FA);
router.post("/auth/2fa/verificar", verificar2FALogin);
export default router;
