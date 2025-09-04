import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import argon2 from "argon2";
import { addDays } from "date-fns";
import { Sesion } from "../models/session"; // tu modelo
import { Usuario } from "../models/usuario"; // el modelo de usuario

export async function generateTokens(user: Usuario) {
  console.log("🏭 === INICIO generateTokens ===");
  console.log("👤 Generando para usuario:", user.correo, "(ID:", user.id, ")");

  // Generar refresh token plano
  const refreshTokenPlain = randomBytes(64).toString("hex");
  console.log(
    "🔑 Token plano generado (primeros 20):",
    refreshTokenPlain.substring(0, 20) + "..."
  );

  const refreshTokenHash = await argon2.hash(refreshTokenPlain);
  console.log(
    "🔐 Hash generado (primeros 20):",
    refreshTokenHash.substring(0, 20) + "..."
  );

  // Fecha de caducidad del refresh
  const expiresAt = addDays(new Date(), 7);
  console.log("⏰ Nueva sesión expirará:", expiresAt);

  // Crear sesión en DB
  const session = await Sesion.create({
    user_id: user.id,
    refresh_token_hash: refreshTokenHash,
    expires_at: expiresAt,
    created_at: new Date(),
    is_revoked: false,
    status: "active",
  });

  console.log("💾 Nueva sesión creada en BD:");
  console.log("   ID:", session.id);
  console.log("   User ID:", session.user_id);
  console.log(
    "   Hash (primeros 20):",
    session.refresh_token_hash.substring(0, 20) + "..."
  );

  // Firmar Access Token
  const accessToken = jwt.sign(
    {
      id: user.id,
      nombre: (user as any).nombre,
      correo: (user as any).correo,
      rol: (user as any).rol,
      telefono: (user as any).telefono,
      twofa_enabled: (user as any).twofa_enabled,
    },
    process.env.JWT_SECRET!,
    {
      algorithm: "HS256",
      expiresIn: "1m", // para testing
      jwtid: session.id.toString(),
    }
  );

  console.log("🎫 Access token generado con JTI:", session.id);
  console.log("✅ === FIN generateTokens ===");

  return {
    accessToken,
    refreshToken: refreshTokenPlain, // este va en cookie
  };
}
