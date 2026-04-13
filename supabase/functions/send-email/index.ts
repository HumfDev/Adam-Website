import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const body = await req.json();

    const {
      first_name,
      last_name,
      email,
      company,
      role,
      printer_type,
      num_printers,
      main_challenge,
    } = body;

    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY")!;
    const FROM_EMAIL       = Deno.env.get("FROM_EMAIL")!;
    const FROM_NAME        = Deno.env.get("FROM_NAME") ?? "Adam Biotech";
    const TEAM_EMAIL       = Deno.env.get("TEAM_EMAIL")!;
    const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const sendEmail = (to: string, subject: string, html: string) =>
      fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: FROM_EMAIL, name: FROM_NAME },
          subject,
          content: [{ type: "text/html", value: html }],
        }),
      });

    // ── Confirmation email to the lead ────────────────────────────────
    const confirmationHtml = `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;color:#1c1c1e;">
        <div style="background:#007AFF;padding:32px 40px;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.02em;">
            ADAM<span style="color:#a8d4ff;">BIO</span>
          </h1>
        </div>
        <div style="background:#ffffff;padding:40px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">
            Hi ${first_name}, we got your request.
          </h2>
          <p style="color:#64748b;line-height:1.7;margin:0 0 24px;">
            Thanks for reaching out to Adam Biotech. We've received your information and one of our
            team members will be in touch within <strong style="color:#1c1c1e;">48 hours</strong>
            to set up a conversation.
          </p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px 24px;margin-bottom:28px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8;">
              What you submitted
            </p>
            <table style="width:100%;font-size:14px;color:#64748b;border-collapse:collapse;">
              <tr><td style="padding:4px 0;font-weight:600;color:#1c1c1e;width:40%;">Institution</td><td>${company}</td></tr>
              <tr><td style="padding:4px 0;font-weight:600;color:#1c1c1e;">Role</td><td>${role}</td></tr>
              <tr><td style="padding:4px 0;font-weight:600;color:#1c1c1e;">Bioprinter</td><td>${printer_type}</td></tr>
              ${num_printers ? `<tr><td style="padding:4px 0;font-weight:600;color:#1c1c1e;"># of Printers</td><td>${num_printers}</td></tr>` : ""}
            </table>
          </div>
          <div style="background:#eff6ff;border-left:4px solid #007AFF;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:28px;">
            <p style="margin:0;font-size:13px;color:#1e40af;line-height:1.6;">
              <strong>While you wait:</strong> If you have urgent questions, reply directly to this email
              or reach us at <a href="mailto:${TEAM_EMAIL}" style="color:#007AFF;">${TEAM_EMAIL}</a>.
            </p>
          </div>
          <p style="color:#94a3b8;font-size:12px;margin:0;">
            Adam Biotech, Inc. — University of Washington, Seattle
          </p>
        </div>
      </div>
    `;

    // ── Team alert email ──────────────────────────────────────────────
    const teamAlertHtml = `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;color:#1c1c1e;">
        <div style="background:#1c1c1e;padding:24px 32px;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:16px;font-weight:700;">
            🚨 New Demo Request — Adam Biotech
          </h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tr style="background:#f8fafc;">
              <td style="padding:10px 14px;font-weight:700;color:#64748b;width:38%;border-bottom:1px solid #e2e8f0;">Name</td>
              <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;">${first_name} ${last_name}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-weight:700;color:#64748b;border-bottom:1px solid #e2e8f0;">Email</td>
              <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;">
                <a href="mailto:${email}" style="color:#007AFF;">${email}</a>
              </td>
            </tr>
            <tr style="background:#f8fafc;">
              <td style="padding:10px 14px;font-weight:700;color:#64748b;border-bottom:1px solid #e2e8f0;">Institution</td>
              <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;">${company}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-weight:700;color:#64748b;border-bottom:1px solid #e2e8f0;">Role</td>
              <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;">${role}</td>
            </tr>
            <tr style="background:#f8fafc;">
              <td style="padding:10px 14px;font-weight:700;color:#64748b;border-bottom:1px solid #e2e8f0;">Bioprinter</td>
              <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;">${printer_type}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-weight:700;color:#64748b;">Main Challenge</td>
              <td style="padding:10px 14px;">${main_challenge}</td>
            </tr>
          </table>
        </div>
      </div>
    `;

    // ── Send both emails in parallel ──────────────────────────────────
    const [confirmRes, teamRes] = await Promise.all([
      sendEmail(email, "We got your request — Adam Biotech", confirmationHtml),
      sendEmail(TEAM_EMAIL, `New demo request: ${first_name} ${last_name} — ${company}`, teamAlertHtml),
    ]);

    if (!confirmRes.ok || !teamRes.ok) {
      const err = await (confirmRes.ok ? teamRes : confirmRes).text();
      throw new Error(`SendGrid error: ${err}`);
    }

    // ── Mark email_sent = true in DB ──────────────────────────────────
    if (body.id) {
      await fetch(`${SUPABASE_URL}/rest/v1/demo_requests?id=eq.${body.id}`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ email_sent: true }),
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (err) {
    console.error("send-email error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
