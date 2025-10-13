import type { EmailType } from "~/server/email/types";

type TemplateParams = {
  name?: string | null;
  applicantEmail?: string | null;
};

type TemplateResult = {
  subject: string;
  html: string;
};

const baseStyles = {
  body: [
    "margin:0",
    "background:#0B0B0B",
    "color:#FFFFFF",
    "font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
    "-webkit-font-smoothing:antialiased",
  ].join(";"),
  outerTable: [
    "padding:32px 0",
    "width:100%",
  ].join(";"),
  innerTable: [
    "background:#111111",
    "border:1px solid rgba(255,255,255,0.12)",
    "border-radius:14px",
    "padding:32px",
    "width:640px",
    "max-width:640px",
    "box-shadow:0 16px 40px rgba(0,0,0,0.45)",
  ].join(";"),
  badge: [
    "font-size:12px",
    "letter-spacing:0.24em",
    "color:rgba(255,255,255,0.6)",
    "text-transform:uppercase",
  ].join(";"),
  heading: [
    "font-size:28px",
    "line-height:1.3",
    "font-weight:700",
    "margin:0",
  ].join(";"),
  paragraph: [
    "color:rgba(255,255,255,0.7)",
    "line-height:1.7",
    "font-size:16px",
    "margin:0",
  ].join(";"),
  button: [
    "display:inline-block",
    "background:#FF3600",
    "color:#FFFFFF",
    "text-decoration:none",
    "padding:12px 18px",
    "border-radius:12px",
    "font-weight:600",
    "margin-top:20px",
  ].join(";"),
  footer: [
    "font-size:12px",
    "color:rgba(255,255,255,0.45)",
    "line-height:1.6",
    "margin:0",
  ].join(";"),
};

const renderFrame = (content: string) => `<!doctype html>
<html>
  <body style="${baseStyles.body}">
    <table role="presentation" cellpadding="0" cellspacing="0" style="${baseStyles.outerTable}">
      <tr>
        <td align="center" style="padding:0 24px">
          <table role="presentation" cellpadding="0" cellspacing="0" style="${baseStyles.innerTable}">
            ${content}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const renderGreeting = (name?: string | null) => {
  if (!name) {
    return "Hi there,";
  }
  return `Hi ${name},`;
};

const submittedTemplate = (params: TemplateParams): TemplateResult => {
  const greeting = renderGreeting(params.name);
  return {
    subject: "Vecta — application received",
    html: renderFrame(`
      <tr>
        <td style="${baseStyles.badge}">Vecta Network</td>
      </tr>
      <tr><td style="height:16px"></td></tr>
      <tr>
        <td>
          <h1 style="${baseStyles.heading}">Thanks — we received your application</h1>
        </td>
      </tr>
      <tr><td style="height:20px"></td></tr>
      <tr>
        <td style="${baseStyles.paragraph}">
          ${greeting}<br /><br />
          We appreciate you taking the time to share your background. Our team reviews every application manually and will reach out within 7 days if there’s a fit for one of our partner companies.
        </td>
      </tr>
      <tr><td style="height:20px"></td></tr>
      <tr>
        <td style="${baseStyles.paragraph}">
          In the meantime, you can browse more about Vecta and the operators we work with.
        </td>
      </tr>
      <tr><td style="height:24px"></td></tr>
      <tr>
        <td>
          <a href="https://vecta.co" style="${baseStyles.button}">Explore Vecta</a>
        </td>
      </tr>
      <tr><td style="height:28px"></td></tr>
      <tr>
        <td style="${baseStyles.footer}">
          From the Vecta team — team@vecta.co
        </td>
      </tr>
    `),
  };
};

const rejectionTemplate = (params: TemplateParams): TemplateResult => {
  const greeting = renderGreeting(params.name);
  return {
    subject: "Vecta — application update",
    html: renderFrame(`
      <tr>
        <td style="${baseStyles.badge}">Vecta Network</td>
      </tr>
      <tr><td style="height:16px"></td></tr>
      <tr>
        <td>
          <h1 style="${baseStyles.heading}">Thank you for applying</h1>
        </td>
      </tr>
      <tr><td style="height:20px"></td></tr>
      <tr>
        <td style="${baseStyles.paragraph}">
          ${greeting}<br /><br />
          After careful consideration, we won’t be moving forward right now. We truly appreciate your interest in the Vecta Network and the work you’ve done so far.
        </td>
      </tr>
      <tr><td style="height:20px"></td></tr>
      <tr>
        <td style="${baseStyles.paragraph}">
          We’d love to stay connected. Feel free to reapply when you’ve shipped something new, and explore <a href="https://vecta.co" style="color:#FF7F66;text-decoration:none;">our resources</a> in the meantime.
        </td>
      </tr>
      <tr><td style="height:28px"></td></tr>
      <tr>
        <td style="${baseStyles.footer}">
          From the Vecta team — team@vecta.co
        </td>
      </tr>
    `),
  };
};

const successTemplate = (params: TemplateParams): TemplateResult => {
  const greeting = renderGreeting(params.name);
  return {
    subject: "Vecta — let’s build together",
    html: renderFrame(`
      <tr>
        <td style="${baseStyles.badge}">Vecta Network</td>
      </tr>
      <tr><td style="height:16px"></td></tr>
      <tr>
        <td>
          <h1 style="${baseStyles.heading}">You’re in — welcome to Vecta</h1>
        </td>
      </tr>
      <tr><td style="height:20px"></td></tr>
      <tr>
        <td style="${baseStyles.paragraph}">
          ${greeting}<br /><br />
          We’re excited to share that you’ve been accepted into the Vecta Network. We’ll reach out shortly to line up conversations with operators where we see strong alignment.
        </td>
      </tr>
      <tr><td style="height:20px"></td></tr>
      <tr>
        <td style="${baseStyles.paragraph}">
          While you wait, here’s what to expect next and how to get the most out of the network.
        </td>
      </tr>
      <tr><td style="height:24px"></td></tr>
      <tr>
        <td>
          <a href="https://vecta.co" style="${baseStyles.button}">View next steps</a>
        </td>
      </tr>
      <tr><td style="height:28px"></td></tr>
      <tr>
        <td style="${baseStyles.footer}">
          From the Vecta team — team@vecta.co
        </td>
      </tr>
    `),
  };
};

const templates: Record<EmailType, (params: TemplateParams) => TemplateResult> = {
  application_submitted: submittedTemplate,
  application_rejected: rejectionTemplate,
  application_successful: successTemplate,
};

export const getEmailTemplate = (type: EmailType, params: TemplateParams = {}): TemplateResult => {
  const template = templates[type];
  if (!template) {
    throw new Error(`Unsupported email type: ${type}`);
  }
  return template(params);
};

