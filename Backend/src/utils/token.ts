import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import argon2 from "argon2";
import { addDays } from "date-fns";
import { Sesion } from "../models/session"; // tu modelo
import { Usuario } from "../models/usuario"; // el modelo de usuario

export async function generateTokens(user: Usuario) {
  // Access Token (RS256 con clave privada)
  const accessToken = jwt.sign(
    { sub: user.id },
    process.env.JWT_PRIVATE_KEY!, 
    {
      algorithm: "RS256",
      expiresIn: "15m",
    }
  );

  // Refresh Token: cadena random de 64 bytes hex
  const refreshTokenPlain = randomBytes(64).toString("hex");

  // Hash del refresh token
  const refreshTokenHash = await argon2.hash(refreshTokenPlain);

  // Guardamos en sesiones
  const expiresAt = addDays(new Date(), 7); // expira en 7 días

  await Sesion.create({
    user_id: user.id,
    refresh_token_hash: refreshTokenHash,
    expires_at: expiresAt,
    is_revoked: false,
  } as any);

  return { accessToken, refreshToken: refreshTokenPlain };
}