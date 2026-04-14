const CANDIDATE_TOKEN_KEY    = "candidate_token";
const CANDIDATE_EXPIRY_KEY   = "candidate_token_expiry";
const CANDIDATE_TEST_ID_KEY = "candidate_test_id";

export function saveCandidateToken(token: string, expiresAtUtc: string, testId: string): void {
  sessionStorage.setItem(CANDIDATE_TOKEN_KEY, token);
  sessionStorage.setItem(CANDIDATE_EXPIRY_KEY, expiresAtUtc);
  sessionStorage.setItem(CANDIDATE_TEST_ID_KEY, testId);
}

export function getCandidateToken(currentTestId?: string): string | null {
  const token = sessionStorage.getItem(CANDIDATE_TOKEN_KEY);
  const expiry = sessionStorage.getItem(CANDIDATE_EXPIRY_KEY);
  const storedTestId = sessionStorage.getItem(CANDIDATE_TEST_ID_KEY);

  if (!token) return null;

  if (currentTestId && storedTestId?.trim().toLowerCase() !== currentTestId.trim().toLowerCase()) {
    clearCandidateToken();
    return null;
  }

  if (expiry) {
    const expiresAt = new Date(expiry).getTime();
    if (Date.now() > expiresAt) {
      clearCandidateToken();
      return null;
    }
  }

  return token;
}

export function clearCandidateToken(): void {
  sessionStorage.removeItem(CANDIDATE_TOKEN_KEY);
  sessionStorage.removeItem(CANDIDATE_EXPIRY_KEY);
  sessionStorage.removeItem(CANDIDATE_TEST_ID_KEY); 
}