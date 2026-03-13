export interface HrForm {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  totalQuestions: string
  durationMinutes: string
  level: string
  techStackIds: string[]
}

export interface HrMeta {
  levels: string[]
  techStacks: any[]
}

export interface Option {
  value: string;
  label: string;
}

export interface HrRow {
  serialNo?: number | null
  testId?: string | null
  applicantId?: string | null
  applicantName?: string | null
  ApplicantName?: string | null
  fullName?: string | null
  FullName?: string | null
  email?: string | null
  phoneNumber?: string | null
  level?: string | null
  totalQuestions?: number | null
  durationMinutes?: number | null
  techStacks?: string[]
  status?: string
  answeredCount?: number
  correctCount?: number
  createdAtUtc?: string | null
  submittedAtUtc?: string | null
  testToken?: string | null
  expiresAtUtc?: string | null
}

export interface HrCreateEditModalProps {
  open: boolean;
  onClose: () => void;
  form: HrForm;
  setField: (field: keyof HrForm, value: any) => void;
  errors: Partial<Record<keyof HrForm, string>>;
  submitting: boolean;
  editRow?: HrRow | null;
  meta?: HrMeta | null;
  techOptionsNormalized?: any[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  totalQuestions?: string
  durationMinutes?: string
  level?: string
  techStackIds?: string
}