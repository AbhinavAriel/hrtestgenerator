import { api } from "./http";

const unwrap = (res) => {
  const payload = res?.data;

  const isSuccess =
    payload?.isSuccess ??
    payload?.IsSuccess;

  const message =
    payload?.message ??
    payload?.Message;

  const data =
    payload?.data ??
    payload?.Data;

  if (typeof isSuccess === "boolean") {
    if (!isSuccess) throw new Error(message || "Request failed");
    return data;
  }

  return payload;
};

export const getQuestions = async (testId) => {
  const res = await api.get("/questions", {
    params: testId ? { testId } : undefined,
  });
  return unwrap(res);
};