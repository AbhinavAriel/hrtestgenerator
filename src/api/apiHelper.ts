export const unwrap = <T>(res: any): T => {
  const payload = res?.data

  const isSuccess =
    payload?.isSuccess ??
    payload?.IsSuccess

  const message =
    payload?.message ??
    payload?.Message

  const data =
    payload?.data ??
    payload?.Data

  if (typeof isSuccess === "boolean") {
    if (!isSuccess) throw new Error(message || "Request failed")
    return data
  }

  return payload
}

export const normalizeApiError = (e: any): never => {

  const message =
    e?.response?.data?.message ||
    e?.response?.data?.Message ||
    e?.message ||
    "Request failed"

  const err: any = new Error(message)

  err.status = e?.response?.status ?? e?.status
  err.data = e?.response?.data ?? e?.data

  throw err
}