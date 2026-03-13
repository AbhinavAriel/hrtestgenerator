import { Applicant, ApplicantResponse } from "../types/user"

export function mapApplicant(res: ApplicantResponse): Applicant {

  const id = res.id || res.userId || res.userID

  if (!id) {
    throw new Error("User ID not returned from API")
  }

  return {
    id,
    name: res.fullName,
    email: res.email,
    phone: res.phoneNumber
  }
}