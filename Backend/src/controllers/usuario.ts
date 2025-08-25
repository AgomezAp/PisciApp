// controllers/auth.controller.ts
import { Request, Response } from "express";
import { Usuario } from "../models/usuario";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import jwt, { JwtPayload } from "jsonwebtoken";
import { enviarCorreo } from "../services/emailService";
import {
  getResetConfirmationEmailTemplate,
  getResetPasswordEmailTemplate,
  getVerificationEmailTemplate,
} from "../templates/emailTemplates";
import { Sesion } from "../models/session";
import { randomBytes } from "crypto";
import { addDays } from "date-fns";
import argon2 from "argon2";

async function generateTokens(usuario: Usuario) {
  // Access Token
  const accessToken = jwt.sign(
    { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "15m" }
  );

  // Refresh Token random seguro
  const refreshTokenPlain = randomBytes(64).toString("hex");
  const refreshTokenHash = await argon2.hash(refreshTokenPlain);

  const expiresAt = addDays(new Date(), 7); // 7 días

  await Sesion.create({
    user_id: usuario.id,
    refresh_token_hash: refreshTokenHash,
    is_revoked: false,
    expires_at: expiresAt,
  } as any);

  return { accessToken, refreshToken: refreshTokenPlain };
}
export const registrarUsuario = async (req: Request, res: Response) => {
  try {
    const { nombre, correo, contraseña } = req.body;

    // Validar campos
    if (!nombre || !correo || !contraseña) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Validar formato de contraseña fuerte
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(contraseña)) {
      return res.status(400).json({
        message:
          "La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y caracter especial",
      });
    }

    // Verificar si el correo ya existe
    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Generar código de verificación
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    const fechaCobro = new Date();
    fechaCobro.setDate(fechaCobro.getDate() + 30);

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      contraseña: hashedPassword,
      is_verified: false,
      verification_code: verificationCode,
      verification_expires_at: expiresAt,
      periodo_gracia: false,
      periodo_prueba: true,
      fecha_cobro: fechaCobro,
      rol: "Cliente",
    });

    // Enviar correo de verificación
    await enviarCorreo({
      to: correo,
      subject: "Código de verificación",
      text: `Tu código de verificación es: ${verificationCode}`,
      html: getVerificationEmailTemplate(nombre, verificationCode),
    });

    res.status(201).json({
      message: "Usuario registrado, se envió un código de verificación",
      userId: nuevoUsuario.id,
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
export const verificarCodigo = async (req: Request, res: Response) => {
  try {
    const { correo, codigo } = req.body;

    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    console.log("📩 Código recibido:", codigo, typeof codigo);
    console.log(
      "💾 Código guardado:",
      usuario.verification_code,
      typeof usuario.verification_code
    );
    console.log("⏰ Expira:", usuario.verification_expires_at);

    if (
      String(usuario.verification_code).trim() !== String(codigo).trim() ||
      !usuario.verification_expires_at ||
      new Date(usuario.verification_expires_at).getTime() < Date.now()
    ) {
      return res.status(400).json({ message: "Código inválido o vencido" });
    }

    usuario.is_verified = true;
    usuario.verification_code = null;
    usuario.verification_expires_at = null;
    await usuario.save();

    res.json({ message: "Correo verificado con éxito" });
  } catch (error) {
    console.error("Error en verificación:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const loginConGoogle = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID!, // 👈 asegura que es string
    });
    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res.status(400).json({ message: "Token inválido, sin correo" });
    }

    let usuario = await Usuario.findOne({ where: { correo: payload.email } });

    if (!usuario) {
      // Nuevo usuario con Google
      usuario = await Usuario.create({
        nombre: payload.name || "Usuario",
        correo: payload.email,
        google_id: payload.sub,
        foto_perfil: payload.picture || null,
        is_verified: true,
        periodo_prueba: true,
        periodo_gracia: false,
        rol: "Cliente",
        fecha_cobro: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }

    // Generar tokens
    const accessToken = jwt.sign(
      { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: usuario.id },
      process.env.JWT_REFRESH_SECRET || "refresh",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login con Google exitoso",
      usuario,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ message: "Error autenticando con Google" });
  }
};
export const loginHandler = async (req: Request, res: Response) => {
  const { correo, contraseña } = req.body;

  const usuario = await Usuario.findOne({ where: { correo } });
  if (!usuario) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  if (!usuario.is_verified) {
    return res.status(400).json({ message: "Debes verificar tu correo" });
  }

  const valid = await bcrypt.compare(contraseña, usuario.contraseña || "");
  if (!valid) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  // Generamos tokens (Access + Refresh)
  const { accessToken, refreshToken } = await generateTokens(usuario);

  // Mandamos el refresh en cookie HttpOnly
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
  });

  return res.json({
    message: "Inicio de sesión exitoso",
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    },
    accessToken,
  });
};
export const refreshTokenHandler = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refresh_token || req.body.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token requerido" });
  }

  // Buscar en DB
  const sesiones = await Sesion.findAll({ where: { is_revoked: false } });

  let stored: Sesion | null = null;
  for (const sesion of sesiones) {
    const match = await argon2.verify(sesion.refresh_token_hash, refreshToken);
    if (match) {
      stored = sesion;
      break;
    }
  }

  if (!stored) {
    return res.status(403).json({ error: "Refresh token inválido" });
  }

  if (stored.expires_at < new Date()) {
    stored.is_revoked = true;
    await stored.save();
    return res.status(403).json({ error: "Refresh token expirado" });
  }

  // Rotar: revocar el viejo
  stored.is_revoked = true;
  await stored.save();

  // Emitir nuevos tokens
  const usuario = await Usuario.findByPk(stored.user_id);
  if (!usuario) return res.status(403).json({ error: "Usuario no válido" });

  const { accessToken, refreshToken: newRefresh } = await generateTokens(
    usuario
  );

  // Setear nuevo refresh en cookie
  res.cookie("refresh_token", newRefresh, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  return res.json({ accessToken });
};
export const solicitarRecuperacion = async (req: Request, res: Response) => {
  const { correo } = req.body;
  const usuario = await Usuario.findOne({ where: { correo } });

  if (!usuario)
    return res.status(404).json({ message: "Usuario no encontrado" });

  const resetToken = jwt.sign(
    { id: usuario.id },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "15m" }
  );
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await enviarCorreo({
    to: usuario.correo,
    subject: "Recupera tu contraseña",
    text: `Recupera tu contraseña aquí: ${resetLink}`,
    html: getResetPasswordEmailTemplate(usuario.nombre, resetLink),
  });
  res.json({ message: "Se envió un link de recuperación" });
};
export const resetearContraseña = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { nuevaContraseña } = req.body;

  try {
    if (!nuevaContraseña) {
      return res
        .status(400)
        .json({ message: "Debes proporcionar la nueva contraseña" });
    }

    if (!token) {
      return res.status(400).json({ message: "Token no proporcionado" });
    }

    const decoded = jwt.verify(
      token as string,
      process.env.JWT_SECRET || "secret"
    ) as JwtPayload;

    if (!decoded || !decoded.id) {
      return res.status(400).json({ message: "Token inválido" });
    }

    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    usuario.contraseña = await bcrypt.hash(nuevaContraseña, 10);
    await usuario.save();

    // 📧 ENVIAR CORREO DE CONFIRMACIÓN
    await enviarCorreo({
      to: usuario.correo,
      subject: "Tu contraseña fue actualizada",
      text: "Tu contraseña ha sido cambiada exitosamente en Pisci App. Si no fuiste tú, contacta a soporte.",
      html: getResetConfirmationEmailTemplate(usuario.nombre),
    });

    res.json({ message: "Contraseña restablecida con éxito" });
  } catch (err) {
    console.error("Error al resetear contraseña:", err);
    res.status(400).json({ message: "Token inválido o expirado" });
  }
};

export const activar2FA = async (req: Request, res: Response) => {
  const userId = (req as any).usuario.id;
  const usuario = await Usuario.findByPk(userId);

  if (!usuario)
    return res.status(404).json({ message: "Usuario no encontrado" });

  const secret = speakeasy.generateSecret({ length: 20 });
  usuario.twofa_secret = secret.base32;
  await usuario.save();

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

  res.json({ message: "2FA activado", qrCodeUrl });
};
export const verificar2FALogin = async (req: Request, res: Response) => {
  const { userId, token } = req.body;

  const usuario = await Usuario.findByPk(userId);
  if (!usuario || !usuario.twofa_secret)
    return res.status(400).json({ message: "Usuario sin 2FA habilitado" });

  const verified = speakeasy.totp.verify({
    secret: usuario.twofa_secret,
    encoding: "base32",
    token,
  });

  if (!verified)
    return res.status(401).json({ message: "Código 2FA inválido" });

  // emitir un nuevo token JWT como señal de login válido
  const accessToken = jwt.sign(
    { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "15m" }
  );

  res.json({ message: "2FA validado correctamente", accessToken });
};
export const logoutHandler = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refresh_token || req.body.refreshToken;

  if (refreshToken) {
    const sesiones = await Sesion.findAll({ where: { is_revoked: false } });
    for (const sesion of sesiones) {
      const match = await argon2.verify(
        sesion.refresh_token_hash,
        refreshToken
      );
      if (match) {
        sesion.is_revoked = true;
        await sesion.save();
        break;
      }
    }
  }

  res.clearCookie("refresh_token");
  return res.json({ message: "Sesión cerrada" });
};
