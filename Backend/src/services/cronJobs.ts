// services/cronJobs.ts
import cron from "node-cron";
import { Usuario } from "../models/usuario";
import nodemailer from "nodemailer";
import { Op } from "sequelize";
import { enviarCorreo } from "./emailService";
import { getTrialEndingEmailTemplate } from "../templates/emailTemplates";

export const iniciarCronJobs = () => {
  // ----------------------------------------------
  // 1. Usuarios en periodo de gracia
  // ----------------------------------------------
  cron.schedule("0 9 * * *", async () => {
    console.log("⏰ Revisando usuarios en periodo de gracia...");

    const usuarios = await Usuario.findAll({
      where: {
        periodo_gracia: true,
        periodo_gracia_expira: { [Op.gt]: new Date() },
      },
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    for (const user of usuarios) {
      await transporter.sendMail({
        to: user.correo,
        subject: "Problema con tu pago",
        text: `Hola ${
          user.nombre
        }, tu pago no se procesó. Tienes hasta el ${user.periodo_gracia_expira?.toLocaleDateString()} para actualizar tu tarjeta.`,
      });
    }
  });

  // ----------------------------------------------
  // 2. Usuarios en periodo de prueba (aviso 3 días antes)
  // ----------------------------------------------
  cron.schedule("0 9 * * *", async () => {
    console.log("⏰ Revisando usuarios en periodo de prueba...");

    const usuarios = await Usuario.findAll({ where: { periodo_prueba: true } });

    for (const usuario of usuarios) {
      if (usuario.fecha_cobro) {
        const diasRestantes = Math.ceil(
          (usuario.fecha_cobro.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        if (diasRestantes === 3) {
          await enviarCorreo({
            to: usuario.correo,
            subject: "Tu prueba gratuita está por finalizar",
            html: getTrialEndingEmailTemplate(usuario.nombre, diasRestantes),
          });
        }
      }
    }
  });

  // ----------------------------------------------
  // 3. LIMPIEZA de usuarios no verificados con código expirado
  // ----------------------------------------------
  cron.schedule("0 * * * *", async () => {
    console.log("🧹 Marcando usuarios no verificados con código expirado...");

    const [cantidad] = await Usuario.update(
      { eliminado: true },
      {
        where: {
          is_verified: false,
          eliminado: false, // solo los activos
          verification_expires_at: { [Op.lt]: new Date() },
        },
      }
    );

    if (cantidad > 0) {
      console.log(`✅ ${cantidad} usuarios marcados como eliminados`);
    }
  });
};
