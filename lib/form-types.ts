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
  whatsappChannel?: string;
  confirmationMessage?: string;
  closedMessage?: string;
  formFields: WebinarFormField[];
};

export const defaultFormFields: WebinarFormField[] = [
  { id: "full-name", key: "fullName", label: "Full name", type: "text", required: true, unique: false, placeholder: "Enter your full name", minLength: 3, maxLength: 80 },
  { id: "ngo-name", key: "ngoName", label: "Name of NGO", type: "text", required: true, unique: false, placeholder: "Organization name", minLength: 2, maxLength: 150 },
  { id: "ngo-type", key: "ngoType", label: "Type of NGO", type: "select", required: false, unique: false, placeholder: "Select an area of work", options: ["Social Welfare", "Education", "Health", "Drug Abuse Prevention & Narcotics Rehabilitation", "Human Rights", "Women Empowerment", "Child Welfare", "Environment", "Relief & Rehabilitation", "Community Development", "Religious & Charitable", "Other"] },
  { id: "phone", key: "contactNumber", label: "Contact number", type: "tel", required: true, unique: true, placeholder: "e.g. 0300 1234567" },
  { id: "email", key: "email", label: "Email address", type: "email", required: true, unique: true, placeholder: "name@organization.org" },
  { id: "pcc-status", key: "pccRegistered", label: "Is your NGO registered with PCC?", type: "radio", required: true, unique: false, options: ["Yes, registered", "Not registered"] },
];
