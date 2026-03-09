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

const normalizeApiError = (e) => {
  const message =
    e?.response?.data?.message ||
    e?.response?.data?.Message ||
    e?.message ||
    "Request failed";

  const err = new Error(message);
  err.status = e?.response?.status ?? e?.status;
  err.data = e?.response?.data ?? e?.data;
  throw err;
};

export const getQuestions = async (testId) => {
  try {
    const res = await api.get("/questions", {
      params: testId ? { testId } : undefined,
    });
    return unwrap(res);
  } catch (e) {
    normalizeApiError(e);
  }
};

export const createQuestion = async (payload) => {
  try {
    const res = await api.post("/questions", payload);
    return unwrap(res);
  } catch (e) {
    normalizeApiError(e);
  }
};