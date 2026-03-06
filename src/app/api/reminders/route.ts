import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { to, patientName, message, method } = await request.json();

    if (!to || !message) {
      return NextResponse.json({ error: "to and message are required" }, { status: 400 });
    }

    if (method === "email") {
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      if (!RESEND_API_KEY) {
        return NextResponse.json({ error: "RESEND_API_KEY not configured in .env.local" }, { status: 503 });
      }

      const htmlBody = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="background: #d6336c; padding: 16px 24px; border-radius: 12px 12px 0 0;">
            <h2 style="color: white; margin: 0; font-size: 18px;">CareLink Doctor</h2>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
              Hi <strong>${patientName || "there"}</strong>,
            </p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
              ${message}
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #9ca3af; font-size: 12px;">
              This is an automated reminder from your CareLink care team.<br/>
              Dr. Sarah Chen &middot; Cardiology
            </p>
          </div>
        </div>
      `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "CareLink Doctor <onboarding@resend.dev>",
          to: [to],
          subject: "Reminder: Please Take Your Blood Pressure Reading",
          html: htmlBody,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("[Reminder] Resend API error:", data);
        return NextResponse.json({ error: data.message || "Failed to send email" }, { status: res.status });
      }

      console.log("[Reminder] Email sent successfully:", data.id);
      return NextResponse.json({ success: true, emailId: data.id });
    }

    return NextResponse.json({ success: true, demo: true, note: "SMS not configured — demo mode" });

  } catch (error) {
    console.error("[Reminder] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send reminder" },
      { status: 500 }
    );
  }
}
