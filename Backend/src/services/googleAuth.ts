import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Usuario } from "../models/usuario";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const correo = profile.emails?.[0]?.value ?? "";
        const foto_perfil = profile.photos?.[0]?.value ?? null;
        let usuario = await Usuario.findOne({ where: { correo } });

        if (!usuario) {
          usuario = await Usuario.create({
            nombre: profile.displayName,
            correo,
            google_id: profile.id,
            foto_perfil: profile.photos?.[0]?.value ?? null, // 👈 ahora es string | null, que sí es válido
            is_verified: true,
            periodo_prueba: true,
            fecha_cobro: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            rol: "Cliente",
            periodo_gracia: false,
          });
        }

        return done(null, usuario);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

passport.serializeUser((usuario: any, done) => done(null, usuario.id));
passport.deserializeUser(async (id: number, done) => {
  const usuario = await Usuario.findByPk(id);
  done(null, usuario);
});

export default passport;
