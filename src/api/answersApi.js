// src/api/answersApi.js
import { api } from "./http";

const unwrap = (res) => {
  const data = res?.data;
  if (data && typeof data === "object" && "isSuccess" in data) {
    if (!data.isSuccess) throw new Error(data.message || "Request failed");
    return data.data;
  }
  return data;
};

export const submitAnswer = async (payload) => {
  // Send PascalCase keys to match .NET DTO
  const dto = {
    TestId: payload.testId,
    ApplicantId: payload.applicantId,
    QuestionId: payload.questionId,
    SelectedOptionId: payload.selectedOptionId ?? null,
    ElapsedSeconds: Number(payload.elapsedSeconds ?? 0),
  };

  const res = await api.post("/answers", dto);
  return unwrap(res);
};