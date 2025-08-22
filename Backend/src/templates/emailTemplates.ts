// ✅ Verificación con código
export const getVerificationEmailTemplate = (nombre: string, code: string) => `
<html>
  <body style="font-family:Arial;background:#f4f4f7;">
    <div style="background:#fff;padding:20px;max-width:600px;margin:auto;border-radius:8px;">
      <div style="text-align:center;margin-bottom:20px;">
        <img src="cid:logo_pisciapp" alt="Pisci App Logo"
             style="width:120px;display:block;margin:0 auto 20px auto;" />
      </div>
      <h2 style="color:#333;">👋 Bienvenido a Pisci App, ${nombre}</h2>
      <p style="font-size:14px;color:#555;">Tu código de verificación es:</p>
      <h1 style="color:#007bff;text-align:center;margin:20px 0;">${code}</h1>
      <p style="font-size:13px;color:#999;">Expira en 15 minutos.</p>
    </div>
  </body>
</html>
`;

// ✅ Link de restablecer contraseña
export const getResetPasswordEmailTemplate = (nombre: string, resetLink: string) => `
<html>
  <body style="font-family:Arial;background:#f4f4f7;">
    <div style="background:#fff;padding:20px;border-radius:8px;max-width:600px;margin:auto;">
      <div style="text-align:center;margin-bottom:20px;">
        <img src="cid:logo_pisciapp" alt="Pisci App Logo"
             style="width:120px;display:block;margin:0 auto;" />
      </div>
      <h2>Hola, ${nombre}</h2>
      <p>Haz clic en el siguiente botón para restablecer tu contraseña:</p>
      <p style="text-align:center">
        <a href="${resetLink}"
           style="background:#28a745;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">
          Restablecer contraseña
        </a>
      </p>
      <p style="font-size:13px;color:#999;">Si no lo solicitaste, ignora este correo.</p>
    </div>
  </body>
</html>
`;

// ✅ Confirmación de cambio de contraseña
export const getResetConfirmationEmailTemplate = (nombre: string) => `
<html>
  <body style="font-family:Arial;background:#f4f4f7;">
    <div style="background:#fff;padding:20px;border-radius:8px;max-width:600px;margin:auto;">
      <div style="text-align:center;margin-bottom:20px;">
        <img src="cid:logo_pisciapp" alt="Pisci App Logo"
             style="width:120px;display:block;margin:0 auto;" />
      </div>
      <h2>Hola, ${nombre}</h2>
      <p>✅ Tu contraseña fue cambiada exitosamente.</p>
      <p>Si no fuiste tú, contacta soporte de inmediato.</p>
    </div>
  </body>
</html>
`;

// ✅ Notificación de login
export const getLoginNotificationEmailTemplate = (nombre: string, fecha: string, ip?: string) => `
<html>
  <body style="font-family:Arial,sans-serif;background:#f4f4f7;">
    <div style="max-width:600px;margin:auto;background:#fff;padding:20px;border-radius:8px;">
      <div style="text-align:center;margin-bottom:20px;">
        <img src="cid:logo_pisciapp" alt="Pisci App Logo"
             style="width:120px;display:block;margin:0 auto;" />
      </div>
      <h2>Hola, ${nombre}</h2>
      <p>Se detectó un inicio de sesión en tu cuenta.</p>
      <p>📅 Fecha: ${fecha}</p>
      ${ip ? `<p>🌍 IP aproximada: ${ip}</p>` : ""}
      <p>Si no fuiste tú, cambia tu contraseña inmediatamente.</p>
    </div>
  </body>
</html>
`;

// ✅ Notificación de fin de prueba gratis
export const getTrialEndingEmailTemplate = (nombre: string, dias: number) => `
<html>
  <body style="font-family:Arial;background:#f4f4f7;">
    <div style="background:#fff;padding:20px;border-radius:8px;max-width:600px;margin:auto;text-align:center;">
      <div style="text-align:center;margin-bottom:20px;">
        <img src="cid:logo_pisciapp" alt="Pisci App Logo"
             style="width:120px;display:block;margin:0 auto;" />
      </div>
      <h2>⚠ Hola, ${nombre}</h2>
      <p>Tu <b>prueba gratuita</b> expira en <b>${dias} días</b>.</p>
      <a href="https://pisciapp.com/planes"
         style="background:#007bff;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">
        Renovar ahora
      </a>
    </div>
  </body>
</html>
`;

// ✅ Notificación de pago fallido
export const getPaymentFailedEmailTemplate = (nombre: string) => `
<html>
  <body style="font-family:Arial;background:#f4f4f7;">
    <div style="background:#fff;padding:20px;border-radius:8px;max-width:600px;margin:auto;text-align:center;">
      <div style="text-align:center;margin-bottom:20px;">
        <img src="cid:logo_pisciapp" alt="Pisci App Logo"
             style="width:120px;display:block;margin:0 auto;" />
      </div>
      <h2>🚨 Hola, ${nombre}</h2>
      <p>Tu último pago <b>falló</b>. Para mantener tu acceso, actualiza tu método de pago:</p>
      <a href="https://pisciapp.com/facturacion"
         style="background:#dc3545;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">
        Actualizar pago
      </a>
    </div>
  </body>
</html>
`;