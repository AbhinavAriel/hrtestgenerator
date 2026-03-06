import { api } from "./http";

const unwrap = (res) => {
  const data = res?.data;

  if (data && typeof data === "object" && "isSuccess" in data) {
    if (!data.isSuccess) {
      const err = new Error(data.message || "Request failed");
      err.status = res?.status;
      err.data = data;
      throw err;
    }
    return data.data;
  }

  return data;
};

const normalizeApiError = (e) => {
  const status = e?.response?.status ?? e?.status;
  const message =
    e?.response?.data?.message ||
    e?.response?.data?.Message ||
    e?.message ||
    "Request failed";

  const err = new Error(message);
  err.status = status;
  err.data = e?.response?.data ?? e?.data;
  throw err;
};

export const getHrMeta = async () => {
  try {
    return unwrap(await api.get("/hr/meta"));
  } catch (e) {
    normalizeApiError(e);
  }
};

export const getHrTests = async ({ page = 1, pageSize = 10 } = {}) => {
  try {
    return unwrap(await api.get(`/hr/tests?page=${page}&pageSize=${pageSize}`));
  } catch (e) {
    normalizeApiError(e);
  }
};

export const getHrTestById = async (testId) => {
  try {
    if (!testId) throw Object.assign(new Error("Missing testId"), { status: 400 });
    return unwrap(await api.get(`/hr/tests/${testId}`));
  } catch (e) {
    normalizeApiError(e);
  }
};

// ✅ ADD THIS (token validation)
export const getHrTestByToken = async (token) => {
  try {
    const safe = (token || "").trim();
    if (!safe) throw Object.assign(new Error("Invalid test link"), { status: 400 });
    return unwrap(await api.get(`/hr/tests/by-token/${safe}`));
  } catch (e) {
    normalizeApiError(e);
  }
};

export const createHrTest = async (payload) => {
  try {
    return unwrap(await api.post("/hr/tests", payload));
  } catch (e) {
    normalizeApiError(e);
  }
};

export const updateHrTest = async (testId, payload) => {
  try {
    if (!testId) throw Object.assign(new Error("Missing testId"), { status: 400 });
    return unwrap(await api.put(`/hr/tests/${testId}`, payload));
  } catch (e) {
    normalizeApiError(e);
  }
};

export const deleteHrTest = async (testId) => {
  try {
    if (!testId) throw Object.assign(new Error("Missing testId"), { status: 400 });
    return unwrap(await api.delete(`/hr/tests/${testId}`));
  } catch (e) {
    normalizeApiError(e);
  }
};

export const submitHrTest = async (testId) => {
  try {
    if (!testId) throw Object.assign(new Error("Missing testId"), { status: 400 });
    return unwrap(await api.post(`/hr/tests/${testId}/submit`));
  } catch (e) {
    normalizeApiError(e);
  }
};

export const getHrTestReport = async (testId) => {
  try {
    if (!testId) throw Object.assign(new Error("Missing testId"), { status: 400 });
    return unwrap(await api.get(`/hr/tests/${testId}/report`));
  } catch (e) {
    normalizeApiError(e);
  }
};