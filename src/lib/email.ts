import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendSummaryEmailParams {
  to: string;
  organizationName: string;
  eventName: string;
  summary: string;
  responseCount: number;
  painPoints: string[];
  suggestions: string[];
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export async function sendSummaryEmail(
  params: SendSummaryEmailParams
): Promise<void> {
  const {
    to,
    organizationName,
    eventName,
    summary,
    responseCount,
    painPoints,
    suggestions,
    sentimentDistribution,
  } = params;

  await resend.emails.send({
    from: "CampusPulse AI <noreply@campuspulse.ai>",
    to,
    subject: `📊 Feedback Summary: ${eventName} — ${organizationName}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #6366f1; margin-bottom: 4px;">CampusPulse AI</h1>
        <p style="color: #94a3b8; margin-top: 0;">Feedback Summary Report</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

        <h2 style="color: #1e293b;">${eventName}</h2>
        <p style="color: #64748b;">${organizationName} • ${responseCount} responses</p>

        <h3 style="color: #1e293b;">Summary</h3>
        <p style="color: #475569; line-height: 1.6;">${summary}</p>

        <h3 style="color: #1e293b;">Sentiment Breakdown</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <tr>
            <td style="padding: 8px; color: #22c55e;">😊 Positive</td>
            <td style="padding: 8px; text-align: right; font-weight: 600;">${sentimentDistribution.positive}%</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #eab308;">😐 Neutral</td>
            <td style="padding: 8px; text-align: right; font-weight: 600;">${sentimentDistribution.neutral}%</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #ef4444;">😞 Negative</td>
            <td style="padding: 8px; text-align: right; font-weight: 600;">${sentimentDistribution.negative}%</td>
          </tr>
        </table>

        <h3 style="color: #1e293b;">Top Pain Points</h3>
        <ul style="color: #475569; line-height: 1.8;">
          ${painPoints.map((p) => `<li>${p}</li>`).join("")}
        </ul>

        <h3 style="color: #1e293b;">Suggestions</h3>
        <ul style="color: #475569; line-height: 1.8;">
          ${suggestions.map((s) => `<li>${s}</li>`).join("")}
        </ul>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          Powered by CampusPulse AI
        </p>
      </div>
    `,
  });
}
