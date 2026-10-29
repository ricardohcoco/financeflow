const unavailableCodes = new Set([
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "08000",
  "08001",
  "08003",
  "08006",
  "08007",
  "57P01",
  "57P02",
  "57P03",
  "53300",
]);

export function getErrorCode(error: unknown): string {
  if (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return "UNKNOWN";
}

export function isDatabaseUnavailable(error: unknown): boolean {
  const code = getErrorCode(error);

  if (unavailableCodes.has(code)) {
    return true;
  }

  return code.startsWith("08") && code.length === 5;
}
