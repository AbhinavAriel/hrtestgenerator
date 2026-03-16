export interface ApplicantForm {
  name: string
  email: string
  phone: string
}

export interface Applicant {
  id: string
  testId?: string
  name: string
  email: string
  phone: string
}

export interface FormErrors {
  name?: string
  email?: string
  phone?: string
}

export interface ApplicantResponse {
  id?: string
  userId?: string
  userID?: string
  fullName: string
  email: string
  phoneNumber: string
}