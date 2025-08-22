// services/cronJobs.ts
import cron from "node-cron";
import { Usuario } from "../models/usuario";
import nodemailer from "nodemailer";
import { Op } from "sequelize";
import { enviarCorreo } from "./emailService";
import { getTrialEndingEmailTemplate } from "../templates/emailTemplates";

export const iniciarCronJobs = () => {
  // Ejecutar a las 9 AM todos los días
  cron.schedule("0 9 * * *", async () => {
    console.log("Revisando usuarios en periodo de gracia...");

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
        text: `Hola ${user.nombre}, tu pago no se procesó. Tienes hasta el ${user.periodo_gracia_expira} para actualizar tu tarjeta.`,
      });
    }
  });
  cron.schedule("0 9 * * *", async () => {
  const usuarios = await Usuario.findAll({ where: { periodo_prueba: true } });
  for (const usuario of usuarios) {
    if (usuario.fecha_cobro) {
      const diasRestantes = Math.ceil(
        (usuario.fecha_cobro.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (diasRestantes === 3) { // ejemplo: enviar notificación 3 días antes
        await enviarCorreo({
          to: usuario.correo,
          subject: "Tu prueba gratuita está por finalizar",
          html: getTrialEndingEmailTemplate(usuario.nombre, diasRestantes),
        });
      }
    }
  }
});
};