import { api } from "./http";

export async function loginAdmin(payload) {
  const response = await api.post("/auth/login", payload);
  return response?.data;
}