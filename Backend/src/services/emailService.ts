import nodemailer from "nodemailer";
import path from "path";

const transporter = nodemailer.createTransport({
  service: "gmail", // puedes cambiar a Outlook, etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const enviarCorreo = async ({
  to,
  subject,
  text,
  html,
}: EmailOptions) => {
  try {
    await transporter.sendMail({
      from: `"Pisci App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(process.cwd(), "src/assets/logo.png"),
          cid: "logo_pisciapp", // referencia para usar en plantilla
        },
      ],
    });

    console.log("📧 Correo enviado exitosamente a:", to);
  } catch (error) {
    console.error("❌ Error enviando correo ->", error);
    throw new Error("Error enviando correo");
  }
};
