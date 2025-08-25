import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import argon2 from "argon2";
import { addDays } from "date-fns";
import { Sesion } from "../models/session"; // tu modelo
import { Usuario } from "../models/usuario"; // el modelo de usuario

export async function generateTokens(user: Usuario) {
  // Generar refresh token plano
  const refreshTokenPlain = randomBytes(64).toString("hex");
  const refreshTokenHash = await argon2.hash(refreshTokenPlain);

  // Crear sesión en DB
  const expiresAt = addDays(new Date(), 7); // refresco dura 7 días
  const session = await Sesion.create({
    user_id: user.id,
    refresh_token_hash: refreshTokenHash,
    expires_at: expiresAt,
    is_revoked: false,
    status: "active", // si tienes este campo
  } as any);

  // Firmar access token con referencia al id de sesión (JTI)
  const accessToken = jwt.sign(
    {
      id: user.id,
      correo: (user as any).correo,
      rol: (user as any).rol,
    },
    process.env.JWT_SECRET!,
    {
      algorithm: "HS256",
      expiresIn: "15m",
      jwtid: session.id.toString(), // 👈 aquí va el id de sesión
    }
  );

  return { accessToken, refreshToken: refreshTokenPlain };
}
