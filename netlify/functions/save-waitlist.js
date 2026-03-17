const Airtable = require("airtable");
const nodemailer = require("nodemailer");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { email, niche, description, idealClients } = data;

  if (!email || !niche || !description || !idealClients) {
    return { statusCode: 400, body: JSON.stringify({ error: "All fields are required" }) };
  }

  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    await base("Waitlist").create([{
      fields: {
        Email: email,
        Niche: niche,
        Description: description,
        IdealClients: idealClients,
        CreatedAt: new Date().toISOString()
      }
    }]);
  } catch (err) {
    console.error("Airtable error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to save" }) };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Leadly AI" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "You're on the Leadly AI waitlist 🚀",
      html: `<div style="background:#0a0a0a;padding:40px;font-family:Arial,sans-serif;"><div style="max-width:500px;margin:0 auto;background:#111;border-radius:16px;padding:36px;border:1px solid rgba(139,92,246,0.2);"><h1 style="color:#fff;font-size:22px;">You're on the list 🚀</h1><p style="color:#666;font-size:15px;line-height:1.7;">Thank you for joining Leadly AI. We're building something powerful for freelancers and agencies to get clients using AI.</p><p style="color:#666;font-size:15px;line-height:1.7;">You'll be the <strong style="color:#a78bfa;">first to know</strong> when we launch.</p><p style="color:#444;font-size:14px;margin-top:24px;">— The Leadly AI Team</p></div></div>`
    });
  } catch (err) {
    console.error("Email error:", err);
    return { statusCode: 200, body: JSON.stringify({ success: true, warning: "Saved but email failed" }) };
  }

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
