import { Resend } from "resend";

export async function sendPasswordResetEmail(
  apiKey: string,
  to: string,
  resetUrl: string
): Promise<void> {
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: "Gastadero <noreply@nahuelclotet.com.ar>",
    to,
    subject: "Restablecer tu contraseña - Gastadero",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Restablecer contraseña</h2>
        <p style="color: #475569;">Recibimos una solicitud para restablecer la contraseña de tu cuenta en Gastadero.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
            Restablecer contraseña
          </a>
        </p>
        <p style="color: #94a3b8; font-size: 14px;">Este link expira en 1 hora. Si no solicitaste esto, ignora este email.</p>
      </div>
    `,
  });
}
