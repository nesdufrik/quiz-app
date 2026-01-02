import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

export const emailService = {
  /**
   * Envía un correo de notificación de acceso activado
   */
  async sendAccessActivatedEmail(email: string, nombre: string) {
    if (!resend) return { success: false, error: 'Resend API Key not configured' };

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h1 style="color: #10b981;">¡Tu acceso ha sido habilitado!</h1>
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Te informamos que un administrador ha habilitado tu acceso al <strong>Sistema de Evaluación 2026</strong> sin restricciones.</p>
        <p>Ya puedes disfrutar de todas las funcionalidades, incluyendo el Modo Estudio completo y los Simulacros de Evaluación.</p>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/inicio" 
             style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Ir al Dashboard
          </a>
        </div>
        <p style="margin-top: 40px; font-size: 0.8em; color: #64748b;">
          Este es un correo automático, por favor no respondas a este mensaje.
        </p>
      </div>
    `;

    try {
      const { data, error } = await resend.emails.send({
        from: 'Sistema de Evaluación <notificaciones@tu-dominio.com>',
        to: [email],
        subject: '¡Tu acceso al Sistema de Evaluación ha sido habilitado!',
        html: htmlContent,
      });

      if (error) return { success: false, error };
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  }
};