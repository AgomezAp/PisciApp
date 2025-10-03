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
import { generateTokens } from "../utils/token";

export const registrarUsuario = async (req: Request, res: Response) => {
  try {
    const { nombre, correo, contrasena, telefono, departamento, ciudad } =
      req.body;

    // 🟢 Primero: validar campos obligatorios
    if (!nombre || !correo || !contrasena || !telefono) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // 🟢 Validar formato de contraseña fuerte
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(contrasena)) {
      return res.status(400).json({
        message:
          "La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y caracter especial",
      });
    }

    // 🟢 Verificar si ya existe usuario con ese correo
    let usuario = await Usuario.findOne({ where: { correo } });

    if (usuario) {
      if (usuario.eliminado) {
        // 🔄 Reactivamos el usuario marcado como eliminado
        usuario.nombre = nombre;
        usuario.telefono = telefono;
        usuario.departamento = departamento;
        usuario.ciudad = ciudad;
        usuario.contrasena = await bcrypt.hash(contrasena, 10);
        usuario.is_verified = false;
        usuario.eliminado = false;
        usuario.verification_code = crypto.randomInt(100000, 999999).toString();
        usuario.verification_expires_at = new Date(Date.now() + 15 * 60 * 1000);
        await usuario.save();

        // ✉️ Mandamos correo con nuevo código
        await enviarCorreo({
          to: correo,
          subject: "Código de verificación (Cuenta reactivada)",
          html: getVerificationEmailTemplate(
            nombre,
            usuario.verification_code!
          ),
        });

        return res.status(200).json({
          message:
            "Usuario reactivado, se envió un nuevo código de verificación",
          userId: usuario.id,
        });
      }

      // 🚨 Si no está eliminado, no dejamos registrar de nuevo
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // 🟢 Si no existe usuario, ahora sí creamos uno nuevo
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const fechaCobro = new Date();
    fechaCobro.setDate(fechaCobro.getDate() + 30);

    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      contrasena: hashedPassword,
      telefono,
      departamento,
      ciudad,
      is_verified: false,
      eliminado: false,
      verification_code: verificationCode,
      verification_expires_at: expiresAt,
      periodo_gracia: false,
      periodo_prueba: true,
      fecha_cobro: fechaCobro,
      rol: "Cliente",
    });

    // ✉️ Enviamos correo con código de verificación
    await enviarCorreo({
      to: correo,
      subject: "Código de verificación",
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
      audience: process.env.GOOGLE_CLIENT_ID!,
    });
    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res.status(400).json({ message: "Token inválido, sin correo" });
    }

    let usuario = await Usuario.findOne({ where: { correo: payload.email } });

    if (!usuario) {
      // Nuevo usuario vía Google
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
        // 👇 Opcionales en Google (pueden quedarse null)
        telefono: null,
        departamento: null,
        ciudad: null,
      });
    }

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
  const { correo, contrasena } = req.body;

  const usuario = await Usuario.findOne({ where: { correo } });
  if (!usuario) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  if (!usuario.is_verified) {
    return res.status(400).json({ message: "Debes verificar tu correo" });
  }

  const valid = await bcrypt.compare(contrasena, usuario.contrasena || "");
  if (!valid) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  // ✅ SI TIENE 2FA activo, pedir el código primero
  if (usuario.twofa_enabled) {
    return res.json({
      requires2FA: true,
      userId: usuario.id,
      message: "Se requiere validación de 2FA",
    });
  }

  // ✅ Si no tiene 2FA, login normal con tokens
  const { accessToken, refreshToken } = await generateTokens(usuario);

  // Guardar refresh token en DB hasheado
  const hash = await argon2.hash(refreshToken);
  await Sesion.create({
    user_id: usuario.id,
    refresh_token_hash: hash,
    is_revoked: false,
    created_at: new Date(),
    expires_at: addDays(new Date(), 7),
  });

  // Guardar refresh en cookie
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: false, // true en producción
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  // 🚨 Aquí antes SOLO devolvías accessToken
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
  console.log("📩 Se llamó a /auth/refresh");

  // 1. Extraer refresh token desde cookie o body
  const refreshToken = req.cookies.refresh_token || req.body.refreshToken;
  console.log(
    "🔑 Refresh token recibido:",
    refreshToken ? refreshToken.substring(0, 20) + "..." : "NULO"
  );

  if (!refreshToken) {
    console.warn("⚠️ No se envió refresh token");
    return res.status(400).json({ error: "Refresh token requerido" });
  }

  // 2. Buscar sesión activa en DB
  const sesiones = await Sesion.findAll({ where: { is_revoked: false } });
  console.log(`🔎 Se encontraron ${sesiones.length} sesiones activas en DB`);
  let stored: Sesion | null = null;

  for (const sesion of sesiones) {
    if (!sesion.refresh_token_hash) continue;

    try {
      const match = await argon2.verify(
        sesion.refresh_token_hash,
        refreshToken
      );
      console.log(`🧩 Comparando refreshToken vs hash -> match=${match}`);
      if (match) {
        stored = sesion;
        break;
      }
    } catch (err) {
      console.error(
        `❌ Error verificando hash con argon2 en sesión id=${sesion.id}`,
        err
      );
    }
  }

  if (!stored) {
    console.warn("🚫 No se encontró sesión que coincida con el refresh token");
    return res.status(403).json({ error: "Refresh token inválido" });
  }

  console.log(
    `✅ Match encontrado en sesión id=${stored.id}, user_id=${stored.user_id}`
  );

  // 3. Validar expiración
  if (stored.expires_at < new Date()) {
    console.warn(`⏰ Refresh expirado en sesión id=${stored.id}`);
    stored.is_revoked = true;
    await stored.save();
    return res.status(403).json({ error: "Refresh token expirado" });
  }

  // 4. Revocar la sesión usada (rotación de refresh)
  stored.is_revoked = true;
  await stored.save();
  console.log(`♻️ Sesión ${stored.id} revocada (refresh usado)`);

  // 5. Emitir nuevos tokens
  const usuario = await Usuario.findByPk(stored.user_id);
  if (!usuario) {
    console.error(`🚨 Usuario no encontrado para sesión id=${stored.id}`);
    return res.status(403).json({ error: "Usuario no válido" });
  }

  const { accessToken, refreshToken: newRefresh } = await generateTokens(
    usuario
  );
  console.log(`🎟️ Nuevos tokens generados para user_id=${usuario.id}`);

  // 6. Guardar el nuevo refresh en DB
  const newHash = await argon2.hash(newRefresh);
  await Sesion.create({
    user_id: usuario.id,
    refresh_token_hash: newHash,
    is_revoked: false,
    created_at: new Date(),
    expires_at: addDays(new Date(), 7), // refresh válido otra semana
  });
  console.log("💾 Nueva sesión guardada con refresh token rotado");

  // 7. Enviar el nuevo refresh token en cookie
  res.cookie("refresh_token", newRefresh, {
    httpOnly: true,
    secure: false, // ⚠️ en producción -> true
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  console.log("🍪 Refresh token actualizado en cookie");

  // 8. Devolver el access token
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
  const resetLink = `${process.env.FRONTEND_URL}/reiniciar-contraseña/${resetToken}`;
  await enviarCorreo({
    to: usuario.correo,
    subject: "Recupera tu contrasena",
    text: `Recupera tu contrasena aquí: ${resetLink}`,
    html: getResetPasswordEmailTemplate(usuario.nombre, resetLink),
  });
  res.json({ message: "Se envió un link de recuperación" });
};

export const resetearcontraseña = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { nuevacontrasena } = req.body;

  try {
    if (!nuevacontrasena) {
      return res
        .status(400)
        .json({ message: "Debes proporcionar la nueva contrasena" });
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

    usuario.contrasena = await bcrypt.hash(nuevacontrasena, 10);
    await usuario.save();

    // 📧 ENVIAR CORREO DE CONFIRMACIÓN
    await enviarCorreo({
      to: usuario.correo,
      subject: "Tu contrasena fue actualizada",
      text: "Tu contrasena ha sido cambiada exitosamente en Pisci App. Si no fuiste tú, contacta a soporte.",
      html: getResetConfirmationEmailTemplate(usuario.nombre),
    });

    res.json({ message: "contrasena restablecida con éxito" });
  } catch (err) {
    console.error("Error al resetear contrasena:", err);
    res.status(400).json({ message: "Token inválido o expirado" });
  }
};

export const activar2FA = async (req: Request, res: Response) => {
  const userId = (req as any).usuario.id;
  const usuario = await Usuario.findByPk(userId);

  if (!usuario)
    return res.status(404).json({ message: "Usuario no encontrado" });

  const secret = speakeasy.generateSecret({ length: 20 });
  usuario.pending_twofa_secret = secret.base32;
  await usuario.save();

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

  res.json({
    success: true,
    message: "2FA activado",
    qrCodeUrl,
    twofa_enabled: false, // aún no confirmado
  });
};

export const verificar2FALogin = async (req: Request, res: Response) => {
  const { userId, token } = req.body;

  const usuario = await Usuario.findByPk(userId);
  if (!usuario || !usuario.twofa_secret) {
    return res.status(400).json({ message: "Usuario sin 2FA habilitado" });
  }
  console.log("userId:", userId);
  console.log("token ingresado:", token);
  console.log("secret almacenado:", usuario.twofa_secret);
  const verified = speakeasy.totp.verify({
    secret: usuario.twofa_secret,
    encoding: "base32",
    token,
    window: 1,
  });
  console.log("Resultado verificación 2FA:", verified);
  if (!verified) {
    return res.status(401).json({ message: "Código 2FA inválido" });
  }

  const { accessToken, refreshToken } = await generateTokens(usuario);

  // Guardar refresh token en DB hasheado
  const hash = await argon2.hash(refreshToken);
  await Sesion.create({
    user_id: usuario.id,
    refresh_token_hash: hash,
    is_revoked: false,
    created_at: new Date(),
    expires_at: addDays(new Date(), 7),
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  res.json({
    success: true,
    message: "2FA validado correctamente",
    accessToken,
    twofa_enabled: true,
  });
};
export const desactivar2FA = async (req: Request, res: Response) => {
  const userId = (req as any).usuario.id;
  const { token } = req.body;

  const usuario = await Usuario.findByPk(userId);
  if (!usuario || !usuario.twofa_secret) {
    return res.status(400).json({
      success: false,
      message: "El usuario no tiene 2FA activo",
    });
  }

  const verified = speakeasy.totp.verify({
    secret: usuario.twofa_secret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!verified) {
    return res.status(401).json({
      success: false,
      message: "Código inválido",
    });
  }

  usuario.twofa_secret = null;
  usuario.twofa_enabled = false;
  await usuario.save();

  return res.json({
    success: true,
    message: "2FA desactivado correctamente",
    twofa_enabled: false,
  });
};
export const confirmar2FA = async (req: Request, res: Response) => {
  const userId = (req as any).usuario.id;
  const { token } = req.body;

  const usuario = await Usuario.findByPk(userId);
  if (!usuario || !usuario.pending_twofa_secret) {
    return res
      .status(400)
      .json({ message: "No hay 2FA pendiente de activación" });
  }

  const verified = speakeasy.totp.verify({
    secret: usuario.pending_twofa_secret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!verified) {
    return res.status(401).json({ message: "Código inválido" });
  }

  // Confirmar activación
  usuario.twofa_secret = usuario.pending_twofa_secret;
  usuario.pending_twofa_secret = null;
  usuario.twofa_enabled = true;
  await usuario.save();

  res.json({
    success: true,
    message: "2FA habilitado correctamente",
    twofa_enabled: true,
  });
  res.json({
    success: true,
    message: "2FA habilitado correctamente",
    twofa_enabled: true,
  });
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

// controllers/usuario.ts
export const actualizarPreferencias = async (req: Request, res: Response) => {
  const userId = (req as any).usuario.id;
  const { noti_email, noti_alertas, tema, idioma } = req.body;

  try {
    const usuario = await Usuario.findByPk(userId);
    if (!usuario) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    usuario.noti_email = noti_email;
    usuario.noti_alertas = noti_alertas;
    usuario.tema = tema;
    usuario.idioma = idioma;
    await usuario.save();

    return res.json({
      success: true,
      message: "Preferencias actualizadas correctamente",
      noti_email: usuario.noti_email,
      noti_alertas: usuario.noti_alertas,
      tema: usuario.tema,
      idioma: usuario.idioma,
    });
  } catch (error) {
    console.error("Error guardando preferencias:", error);
    return res.status(500).json({ success: false, message: "Error en servidor" });
  }
};
// controllers/usuario.ts
export const getProfile = async (req: Request, res: Response) => {
  const userId = (req as any).usuario.id;

  try {
    const usuario = await Usuario.findByPk(userId, {
      attributes: [
        "id",
        "nombre",
        "correo",
        "rol",
        "telefono",
        "twofa_enabled",
        "noti_email",
        "noti_alertas",
        "tema",
        "idioma",
      ],
    });

    if (!usuario) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    return res.json({
      success: true,
      usuario, // 👈 siempre actualizado desde BD
    });
  } catch (error) {
    console.error("Error al traer perfil:", error);
    return res.status(500).json({ success: false, message: "Error en servidor" });
  }
};