// Vercel Function: POST /api/contact
// Sends the contact form to the team by email through Resend (https://resend.com).
// Environment variables, set in Vercel > Project > Settings > Environment Variables:
//   RESEND_API_KEY  required. Without it the form answers 503 and the page offers a mailto link instead.
//   CONTACT_TO      where messages go. Default: contact@gami.ventures
//   CONTACT_FROM    sender, on a domain verified in Resend. Default: "Gami Capital website <website@gami.ventures>"

const ROLES = { founder: 'Founder', investor: 'Investor', partner: 'Partner', press: 'Press', other: 'Other' };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function wantsJson(request) {
  return (request.headers.get('accept') || '').includes('application/json');
}

function reply(request, status, body) {
  if (wantsJson(request)) {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  }
  // Browsers without JavaScript posted a normal form: send them to a page.
  const to = body.ok ? '/contact/sent' : '/contact?error=1#write';
  return new Response(null, { status: 303, headers: { Location: to } });
}

async function readBody(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) return await request.json();
  const form = await request.formData();
  return Object.fromEntries(form);
}

const clean = (v, max) => String(v ?? '').replace(/\r/g, '').trim().slice(0, max);

export async function POST(request) {
  let data;
  try {
    data = await readBody(request);
  } catch {
    return reply(request, 400, { ok: false, error: 'Invalid request' });
  }

  // Spam traps: a hidden field humans leave empty, and forms sent less than 3 seconds after loading.
  const started = Number(data.t);
  if (clean(data.fax, 200) || (started && Date.now() - started < 3000)) {
    return reply(request, 200, { ok: true });
  }

  const msg = {
    role: ROLES[clean(data.role, 20)] || 'Other',
    name: clean(data.name, 120),
    email: clean(data.email, 200),
    company: clean(data.company, 160),
    link: clean(data.link, 400),
    message: clean(data.message, 5000),
    consent: clean(data.consent, 10),
  };
  if (!msg.name || !EMAIL.test(msg.email) || msg.message.length < 20 || msg.consent !== 'yes') {
    return reply(request, 422, { ok: false, error: 'Please check the form fields' });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) return reply(request, 503, { ok: false, error: 'Form not configured' });

  const subject = `[Website] ${msg.role}, ${msg.name}${msg.company ? ` (${msg.company})` : ''}`;
  const text = [
    `Role: ${msg.role}`,
    `Name: ${msg.name}`,
    `Email: ${msg.email}`,
    msg.company ? `Company: ${msg.company}` : null,
    msg.link ? `Link: ${msg.link}` : null,
    '',
    msg.message,
    '',
    '--',
    'Sent from the contact form. The sender agreed to the privacy policy.',
  ].filter((l) => l !== null).join('\n');

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || 'Gami Capital website <website@gami.ventures>',
        to: [process.env.CONTACT_TO || 'contact@gami.ventures'],
        reply_to: msg.email,
        subject,
        text,
      }),
    });
    if (!r.ok) {
      console.error('Resend error', r.status, await r.text());
      return reply(request, 502, { ok: false, error: 'Could not send' });
    }
  } catch (err) {
    console.error('Resend unreachable', err);
    return reply(request, 502, { ok: false, error: 'Could not send' });
  }
  return reply(request, 200, { ok: true });
}

export function GET() {
  return new Response(null, { status: 405, headers: { Allow: 'POST' } });
}
