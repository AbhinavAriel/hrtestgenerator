import axios from "axios";

const API_BASE_URL = "http://localhost:5143/api";

export const createApplicant = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      fullName: data.name,       
      email: data.email,
      phoneNumber: data.phone,  
    });

    return response.data;
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      "Unable to register. Please try again.";

    throw new Error(msg);
  }
};