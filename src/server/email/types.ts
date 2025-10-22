export type EmailType =
  | "application_submitted"
  | "application_rejected"
  | "application_successful"
  | "application_system_design";

export type SendEmailInput = {
  type: EmailType;
  to: string[];
  params?: {
    name?: string | null;
    applicantEmail?: string | null;
  };
};

