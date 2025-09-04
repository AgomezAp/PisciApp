import { Router } from "express";
import {
  solicitarRecuperacion,
  resetearcontraseña,
  activar2FA,
  verificar2FALogin,
  desactivar2FA,
  confirmar2FA,
  actualizarPreferencias,
  getProfile,
  actualizarPerfil,
  subirFotoPerfil,
} from "../controllers/usuario";
import { verifyToken } from "../middlewares/verifyToken";
import { upload } from "../middlewares/upload";

const router = Router();

// Recuperar contraseña
router.post("/forgot-password", solicitarRecuperacion);
router.post("/reset-password/:token", resetearcontraseña);

// 2FA
router.post("/auth/2fa/activar", verifyToken, activar2FA);
router.post("/auth/2fa/confirmar", verifyToken, confirmar2FA);
router.post("/auth/2fa/desactivar", verifyToken, desactivar2FA);
router.post("/auth/2fa/verificar", verificar2FALogin);
// routes/usuario.ts
router.put("/preferencias", verifyToken, actualizarPreferencias);
router.get("/perfil", verifyToken, getProfile);
router.put("/perfil-actualizar", verifyToken, actualizarPerfil);
router.post("/foto-perfil", verifyToken, upload.single("foto"), subirFotoPerfil);

export default router;
