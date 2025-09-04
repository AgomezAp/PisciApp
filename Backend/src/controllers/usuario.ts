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
        const verifyLink = `${process.env.FRONTEND_URL}/verify-email`;
        // ✉️ Mandamos correo con nuevo código
        await enviarCorreo({
          to: correo,
          subject: "Código de verificación (Cuenta reactivada)",
          html: getVerificationEmailTemplate(
            nombre,
            usuario.verification_code!,
            verifyLink
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
    const verifyLink = `${process.env.FRONTEND_URL}/verify-email`;
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
      html: getVerificationEmailTemplate(nombre, verificationCode, verifyLink),
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

    if (!idToken) {
      return res.status(400).json({ message: "Token de Google requerido" });
    }

    // 🔎 Validar token con Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });
    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res
        .status(400)
        .json({ message: "Token de Google inválido (sin correo)" });
    }

    // Buscar/crear usuario
    let usuario = await Usuario.findOne({ where: { correo: payload.email } });

    if (!usuario) {
      // 🔥 Crear usuario si nunca existió
      usuario = await Usuario.create({
        nombre: payload.name || "Usuario Google",
        correo: payload.email,
        google_id: payload.sub,
        foto_perfil: payload.picture || null,
        is_verified: true,
        periodo_prueba: true,
        periodo_gracia: false,
        rol: "Cliente",
        fecha_cobro: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        telefono: null,
        departamento: null,
        ciudad: null,
      });
      console.log("🆕 Usuario registrado con Google:", usuario.correo);
    } else {
      console.log("✅ Usuario existente login Google:", usuario.correo);
    }

    // Revocar sesiones previas activas de este usuario
    await Sesion.update(
      { is_revoked: true },
      { where: { user_id: usuario.id, is_revoked: false } }
    );

    // Generar nuevos tokens + sesión
    const { accessToken, refreshToken } = await generateTokens(usuario);

    // Guardar refresh en cookie
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.json({
      message: "Login con Google exitoso",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        foto_perfil: usuario.foto_perfil,
      },
      accessToken,
    });
  } catch (error) {
    console.error("❌ Error en loginConGoogle:", error);
    return res.status(500).json({ message: "Error autenticando con Google" });
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

  if (usuario.twofa_enabled) {
    return res.json({
      requires2FA: true,
      userId: usuario.id,
      message: "Se requiere validación de 2FA",
    });
  }
  await Sesion.update(
    { is_revoked: true },
    { where: { user_id: usuario.id, is_revoked: false } }
  );

  // ✅ Generar access + refresh (YA maneja la sesión en DB)
  const { accessToken, refreshToken } = await generateTokens(usuario);

  // ✅ Guardar refresh en cookie
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
  console.log("🚀 === INICIO refreshTokenHandler ===");

  // Debug de cookies recibidas
  console.log("🍪 Todas las cookies recibidas:", req.cookies);
  console.log("🍪 Headers de la request:", req.headers.cookie);

  const refreshToken = req.cookies.refresh_token;
  console.log(
    "🔑 Refresh token extraído:",
    refreshToken ? "SÍ EXISTE" : "❌ NO EXISTE"
  );
  console.log("🔑 Longitud del token:", refreshToken?.length || 0);
  console.log("🔑 Primeros 20 chars:", refreshToken?.substring(0, 20) + "...");

  if (!refreshToken) {
    console.log("❌ SALIENDO: No hay refresh token");
    return res.status(400).json({ error: "Falta refresh" });
  }

  // Debug de sesiones en BD
  const sesiones = await Sesion.findAll({ where: { is_revoked: false } });
  console.log("📊 Sesiones activas en BD:", sesiones.length);

  sesiones.forEach((s, index) => {
    console.log(`📋 Sesión ${index + 1}:`);
    console.log(`   ID: ${s.id}`);
    console.log(`   User ID: ${s.user_id}`);
    console.log(`   Expires: ${s.expires_at}`);
    console.log(
      `   Hash (primeros 20 chars): ${s.refresh_token_hash.substring(0, 20)}...`
    );
  });

  let stored: Sesion | null = null;

  // ✅ CORREGIDO: Debug del proceso de verificación
  console.log("🔍 Iniciando verificación de hashes...");
  for (let i = 0; i < sesiones.length; i++) {
    const sesion = sesiones[i]; // ✅ TypeScript sabe que existe porque i < sesiones.length

    if (!sesion) {
      // ✅ Verificación adicional por seguridad
      console.log(`⚠️ Sesión en índice ${i} es undefined, saltando...`);
      continue;
    }

    console.log(`🔐 Verificando sesión ${i + 1} (ID: ${sesion.id})`);

    try {
      const match = await argon2.verify(
        sesion.refresh_token_hash,
        refreshToken
      );
      console.log(`   Resultado: ${match ? "✅ MATCH" : "❌ NO MATCH"}`);

      if (match) {
        stored = sesion;
        console.log(`🎯 ¡ENCONTRADA! Sesión válida: ID ${sesion.id}`);
        break;
      }
    } catch (error) {
      console.log(`   ⚠️ Error verificando hash:`, error);
    }
  }

  if (!stored) {
    console.log("❌ RESULTADO FINAL: Ninguna sesión coincide con el token");
    console.log("🔍 Posibles causas:");
    console.log("   1. Token fue modificado en tránsito");
    console.log("   2. Sesión fue eliminada/revocada");
    console.log("   3. Problema en generación/almacenamiento inicial");
    return res.status(403).json({ error: "Refresh inválido" });
  }

  console.log("✅ Token verificado correctamente");

  // Verificar expiración
  console.log("⏰ Verificando expiración...");
  console.log("   Expira en:", stored.expires_at);
  console.log("   Ahora es:", new Date());
  console.log("   ¿Expirado?:", stored.expires_at < new Date());

  if (stored.expires_at < new Date()) {
    console.log("❌ Token expirado, revocando sesión");
    stored.is_revoked = true;
    await stored.save();
    return res.status(403).json({ error: "Refresh expirado" });
  }

  // Revocar sesión anterior
  console.log("🔄 Revocando sesión anterior y creando nueva...");
  stored.is_revoked = true;
  await stored.save();

  const usuario = await Usuario.findByPk(stored.user_id);
  if (!usuario) {
    console.log("❌ Usuario no encontrado para user_id:", stored.user_id);
    return res.status(403).json({ error: "Usuario no válido" });
  }

  console.log("👤 Usuario encontrado:", usuario.correo);

  // Generar nueva sesión
  console.log("🔄 Generando nuevos tokens...");
  const { accessToken, refreshToken: newRefresh } = await generateTokens(
    usuario
  );

  console.log("✅ Nuevos tokens generados");
  console.log(
    "🔑 Nuevo refresh token (primeros 20):",
    newRefresh.substring(0, 20) + "..."
  );

  // ✅ CORREGIDO: usar newRefresh en lugar de refreshToken
  res.cookie("refresh_token", newRefresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
  });

  console.log("🍪 Nueva cookie enviada al cliente");
  console.log("✅ === FIN refreshTokenHandler exitoso ===");

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
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
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
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
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
    return res
      .status(500)
      .json({ success: false, message: "Error en servidor" });
  }
};
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
        "ciudad",
        "departamento",
        "foto_perfil",
        "twofa_enabled",
        "noti_email",
        "noti_alertas",
        "tema",
        "idioma",
      ],
    });

    if (!usuario) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    // 👇 Base URL dinámica según ambiente
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // 👇 Si la foto existe y no es absoluta, la convierto en absoluta
    if (usuario.foto_perfil && !usuario.foto_perfil.startsWith("http")) {
      usuario.foto_perfil = `${baseUrl}${usuario.foto_perfil}`;
    }

    return res.json({
      success: true,
      usuario,
    });
  } catch (error) {
    console.error("Error al traer perfil:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error en servidor" });
  }
};
export const actualizarPerfil = async (req: Request, res: Response) => {
  const userId = (req as any).usuario.id; // sacado del verifyToken
  const { nombre, telefono, departamento, ciudad, foto_perfil } = req.body;

  try {
    // Buscar usuario en BD
    const usuario = await Usuario.findByPk(userId);
    if (!usuario) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    // Actualizar solo campos permitidos
    if (nombre !== undefined) usuario.nombre = nombre;
    if (telefono !== undefined) usuario.telefono = telefono;
    if (departamento !== undefined) usuario.departamento = departamento;
    if (ciudad !== undefined) usuario.ciudad = ciudad;
    if (foto_perfil !== undefined) usuario.foto_perfil = foto_perfil;

    await usuario.save();

    return res.json({
      success: true,
      message: "Perfil actualizado correctamente",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        telefono: usuario.telefono,
        departamento: usuario.departamento,
        ciudad: usuario.ciudad,
        foto_perfil: usuario.foto_perfil,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("❌ Error actualizando perfil:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error actualizando perfil" });
  }
};
export const subirFotoPerfil = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).usuario.id;
    const usuario = await Usuario.findByPk(userId);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No se ha subido ninguna imagen" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    // ejemplo: http://localhost:3010

    usuario.foto_perfil = `${baseUrl}/uploads/profile_pics/${req.file.filename}`;
    await usuario.save();

    return res.json({
      success: true,
      message: "Foto de perfil actualizada",
      url: usuario.foto_perfil,
    });
  } catch (err) {
    console.error("❌ Error subiendo foto:", err);
    res.status(500).json({ message: "Error subiendo foto" });
  }
};
