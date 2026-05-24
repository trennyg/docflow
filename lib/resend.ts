import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Docflow <noreply@relentlessais.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://docflow.relentlessais.com";

type Params = {
  to: string;
  pageCount: number;
  jobId: string;
};

export async function sendJobCompleteEmail({ to, pageCount, jobId }: Params): Promise<void> {
  const jobUrl = `${APP_URL}/jobs/${jobId}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Extraction complete</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <span style="color:#F9FAFB;font-size:20px;font-weight:600;letter-spacing:-0.5px;">Docflow</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#111111;border:1px solid #1F2937;border-radius:16px;padding:36px 32px;">

              <!-- Checkmark -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <div style="width:52px;height:52px;background:rgba(22,163,74,0.1);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
                      <span style="font-size:24px;line-height:52px;display:block;text-align:center;">✓</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <p style="margin:0 0 8px;text-align:center;color:#F9FAFB;font-size:20px;font-weight:600;">
                Row added to master sheet
              </p>
              <p style="margin:0 0 28px;text-align:center;color:#6B7280;font-size:14px;line-height:1.5;">
                Extraction complete &mdash;
                <span style="font-family:monospace;color:#F9FAFB;">${pageCount}</span>
                page${pageCount !== 1 ? "s" : ""} processed.
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #1F2937;margin:0 0 28px;" />

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${jobUrl}"
                       style="display:inline-block;background:#2563EB;color:#ffffff;text-decoration:none;font-size:14px;font-weight:500;padding:12px 28px;border-radius:8px;">
                      View extraction →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;color:#6B7280;font-size:12px;">
                Docflow &middot; Built by
                <a href="https://relentlessais.com" style="color:#6B7280;">Relentless AIS</a>
              </p>
              <p style="margin:4px 0 0;color:#6B7280;font-size:11px;">
                You&apos;re receiving this because notifications are enabled for your account.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Extraction complete — master sheet updated",
      html,
    });
  } catch (err) {
    // Email failure is non-fatal — log but never throw
    console.error("[resend] Failed to send job complete email:", err);
  }
}
