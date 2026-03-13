import axios, { AxiosError } from "axios"

const API_BASE_URL = "http://localhost:5143/api"

interface CreateApplicantPayload {
  name: string
  email: string
  phone: string
}

export interface ApplicantResponse {
  id?: string
  userId?: string
  userID?: string
  fullName: string
  email: string
  phoneNumber: string
}

export const createApplicant = async (
  data: CreateApplicantPayload
): Promise<ApplicantResponse> => {

  try {

    const response = await axios.post<ApplicantResponse>(
      `${API_BASE_URL}/auth/register`,
      {
        fullName: data.name,
        email: data.email,
        phoneNumber: data.phone,
      }
    )

    return response.data

  } catch (error) {

    const err = error as AxiosError<any>

    const msg =
      err?.response?.data?.message ||
      "Unable to register. Please try again."

    throw new Error(msg)
  }
}