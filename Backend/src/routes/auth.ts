import { Router } from "express";
import {
  registrarUsuario,
  verificarCodigo,
  loginUsuario,
  loginConGoogle,
  refreshAccessToken,
} from "../controllers/usuario";

const router = Router();

// Registro y verificación de correo
router.post("/register", registrarUsuario);
router.post("/verify", verificarCodigo);

// Login tradicional
router.post("/login", loginUsuario);

// Login con Google OAuth2
router.post("/google", loginConGoogle);

// Refresh Tokens
router.post("/refresh", refreshAccessToken);

export default router;  