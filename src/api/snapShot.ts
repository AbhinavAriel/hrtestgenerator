import { request } from "./http"
import { normalizeApiError } from "./apiHelper"
import { API_ENDPOINTS } from "../constants/apiEndpoints"

// ─── Supabase public storage base URL ────────────────────────────────────────
// Bucket is set to PUBLIC in Supabase dashboard (Storage → snapshots → Edit → Public ON)
// ImagePath stored in DB is a relative path, e.g.:
//   91dd511f-.../bbd88fa1-.../1774931795088.jpg
// We prepend this constant to get a directly loadable URL.
const SUPABASE_SNAPSHOT_BASE =
  "https://rlyivurdqnitvjwqqgph.supabase.co/storage/v1/object/public/snapshots/"

/** Converts a raw DB path to a full public URL.
 *  If the value is already a full URL (starts with http) it is returned as-is. */
const toPublicUrl = (path: string): string => {
  if (!path) return ""
  if (path.startsWith("http")) return path          // already a full URL
  return SUPABASE_SNAPSHOT_BASE + path
}

export interface UploadSnapshotPayload {
  testId:      string
  applicantId: string
  imageData:   string
  capturedAt:  string
}

export interface SnapshotRecord {
  id:          string
  testId:      string
  applicantId: string
  imageUrl:    string   // always a full public URL after normalization
  capturedAt:  string
}

export const uploadSnapshot = async (
  payload: UploadSnapshotPayload
): Promise<SnapshotRecord> => {
  try {
    const res = await request<any>(API_ENDPOINTS.SNAPSHOTS.UPLOAD, {
      method: "POST",
      data: {
        TestId:      payload.testId,
        ApplicantId: payload.applicantId,
        ImageData:   payload.imageData,
        CapturedAt:  payload.capturedAt,
      },
    })

    const outer = res?.data ?? res
    const data  = outer?.isSuccess !== undefined ? outer.data : outer

    return {
      id:          data.id          ?? data.Id          ?? "",
      testId:      data.testId      ?? data.TestId      ?? "",
      applicantId: data.applicantId ?? data.ApplicantId ?? "",
      imageUrl:    toPublicUrl(data.imageUrl ?? data.ImageUrl ?? ""),
      capturedAt:  data.capturedAt  ?? data.CapturedAt  ?? "",
    }
  } catch (e) {
    throw normalizeApiError(e)
  }
}

export const getSnapshots = async (
  testId: string
): Promise<SnapshotRecord[]> => {
  try {
    const res = await request<any>(API_ENDPOINTS.SNAPSHOTS.BY_TEST(testId))

    const outer = res?.data ?? res
    const list  = outer?.isSuccess !== undefined ? outer.data : outer

    return Array.isArray(list)
      ? list.map((s: any) => ({
          id:          s.id          ?? s.Id          ?? "",
          testId:      s.testId      ?? s.TestId      ?? "",
          applicantId: s.applicantId ?? s.ApplicantId ?? "",
          imageUrl:    toPublicUrl(s.imageUrl ?? s.ImageUrl ?? s.imagePath ?? s.ImagePath ?? ""),
          capturedAt:  s.capturedAt  ?? s.CapturedAt  ?? "",
        }))
      : []
  } catch (e) {
    throw normalizeApiError(e)
  }
}