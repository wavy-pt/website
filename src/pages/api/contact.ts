import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// Rota renderizada no servidor (serverless na Vercel), não estática.
export const prerender = false;

// === Remetente / destinatário ===
// Domínio wavy.pt verificado no Resend → enviamos de um endereço @wavy.pt.
// FROM é só a identidade de quem envia (qualquer endereço @wavy.pt serve);
// as respostas vão para quem preencheu o formulário, via reply-to.
const FROM = 'Wavy <contacto@wavy.pt>';
const TO = 'geral@wavy.pt';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  if (!apiKey) {
    return json({ success: false, error: 'missing_key' }, 500);
  }

  // Aceita FormData ou JSON
  let data: Record<string, string> = {};
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = (await request.json()) as Record<string, string>;
    } else {
      const fd = await request.formData();
      fd.forEach((v, k) => {
        data[k] = typeof v === 'string' ? v : '';
      });
    }
  } catch {
    return json({ success: false, error: 'bad_request' }, 400);
  }

  // Honeypot anti-spam: se preenchido, finge sucesso e ignora.
  if ((data.botcheck || '').toString().trim()) {
    return json({ success: true });
  }

  const name = (data.name || '').trim();
  const email = (data.email || '').trim();
  const message = (data.message || '').trim();
  const business = (data.business || '').trim();

  if (!name || !email || !message) {
    return json({ success: false, error: 'validation' }, 400);
  }

  // Valida o formato do email também no servidor (a validação do cliente
  // pode ser contornada por um POST direto à API).
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ success: false, error: 'validation' }, 400);
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: [TO],
      replyTo: email,
      subject: `Nova mensagem do site Wavy, ${name}`,
      text:
        `Nome: ${name}\n` +
        `Email: ${email}\n` +
        (business ? `Negócio: ${business}\n` : '') +
        `\nMensagem:\n${message}`,
      html:
        `<h2 style="font-family:sans-serif;color:#1C3C3C">Nova mensagem do site Wavy</h2>` +
        `<p style="font-family:sans-serif"><strong>Nome:</strong> ${escapeHtml(name)}</p>` +
        `<p style="font-family:sans-serif"><strong>Email:</strong> ${escapeHtml(email)}</p>` +
        (business
          ? `<p style="font-family:sans-serif"><strong>Negócio:</strong> ${escapeHtml(business)}</p>`
          : '') +
        `<p style="font-family:sans-serif"><strong>Mensagem:</strong></p>` +
        `<p style="font-family:sans-serif;white-space:pre-wrap">${escapeHtml(message)}</p>`,
    });

    if (error) {
      return json({ success: false, error: 'send_failed' }, 502);
    }
    return json({ success: true });
  } catch {
    return json({ success: false, error: 'exception' }, 500);
  }
};
