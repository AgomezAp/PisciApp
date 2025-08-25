import { Router } from "express";
import {
  registrarUsuario,
  verificarCodigo,
  loginConGoogle,
  loginHandler,
  refreshTokenHandler,
} from "../controllers/usuario";

const router = Router();

// Registro y verificación de correo
router.post("/register", registrarUsuario);
router.post("/verify", verificarCodigo);

// Login tradicional
router.post("/login", loginHandler);
// Login con Google OAuth2
router.post("/google", loginConGoogle);

// Refresh Tokens
router.post("/refresh", refreshTokenHandler);

export default router;  