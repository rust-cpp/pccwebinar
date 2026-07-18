export const fieldTypes = ["text", "email", "tel", "number", "textarea", "select", "radio", "checkbox"] as const;
export type FieldType = (typeof fieldTypes)[number];

export type WebinarFormField = {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  unique: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  minLength?: number;
  maxLength?: number;
};

export type WebinarConfig = {
  _id?: string;
  title: string;
  eyebrow: string;
  heroTitle: string;
  heroAccent: string;
  slug: string;
  description: string;
  date: string;
  venue: string;
  capacity: number;
  status: "draft" | "open" | "closed" | "completed";
  recurringWeekly: boolean;
  recurrenceWeekday: number;
  recurrenceTime: string;
  whatsappChannel?: string;
  confirmationMessage?: string;
  closedMessage?: string;
  formFields: WebinarFormField[];
};

export const defaultFormFields: WebinarFormField[] = [
  { id: "full-name", key: "fullName", label: "Full name", type: "text", required: true, unique: false, placeholder: "Enter your full name", minLength: 3, maxLength: 80 },
  { id: "ngo-name", key: "ngoName", label: "Name of NGO", type: "text", required: true, unique: false, placeholder: "Organization name", minLength: 2, maxLength: 150 },
  { id: "phone", key: "contactNumber", label: "Contact number", type: "tel", required: true, unique: true, placeholder: "e.g. 0300 1234567" },
  { id: "email", key: "email", label: "Email address", type: "email", required: true, unique: true, placeholder: "name@organization.org" },
  { id: "pcc-status", key: "pccRegistered", label: "Is your NGO registered with PCC?", type: "radio", required: true, unique: false, options: ["Yes, registered", "Not registered"] },
  { id: "ngo-type", key: "ngoType", label: "Type of NGO / primary area of work", type: "select", required: false, unique: false, placeholder: "Select the closest area of work", helpText: "This helps PCC organize relevant future sessions.", options: ["Social Welfare", "Education", "Health", "Drug Abuse Prevention & Narcotics Rehabilitation", "Human Rights", "Women Empowerment", "Child Welfare", "Environment", "Relief & Rehabilitation", "Community Development", "Religious & Charitable", "Other"] },
  { id: "charity-profile", key: "charityProfile", label: "Briefly describe your charity's work", type: "textarea", required: true, unique: false, placeholder: "In 2–3 lines, tell us who you serve, what work you do, and where you work.", helpText: "A short profile helps us understand your impact and plan more relevant support.", minLength: 40, maxLength: 600 },
];
