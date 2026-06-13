import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "INVALID_REQUEST"
  | "PAYLOAD_TOO_LARGE"
  | "RATE_LIMITED"
  | "SERVICE_UNAVAILABLE"
  | "ORDER_FAILED";

export function apiError(
  error: string,
  code: ApiErrorCode,
  status: number,
) {
  return NextResponse.json({ error, code }, { status });
}

export function logServerError(
  event: string,
  error: unknown,
  context: Record<string, string | number | boolean | undefined> = {},
) {
  const detail =
    error instanceof Error
      ? { name: error.name, message: error.message }
      : { name: "UnknownError", message: String(error) };
  console.error(
    JSON.stringify({
      level: "error",
      event,
      ...context,
      error: detail,
      timestamp: new Date().toISOString(),
    }),
  );
}

export async function readJsonBody(
  request: Request,
  maximumBytes: number,
): Promise<
  | { ok: true; value: unknown }
  | { ok: false; response: NextResponse }
> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > maximumBytes) {
    return {
      ok: false,
      response: apiError(
        "The request is too large.",
        "PAYLOAD_TOO_LARGE",
        413,
      ),
    };
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return {
      ok: false,
      response: apiError("Invalid request body.", "INVALID_REQUEST", 400),
    };
  }
  if (new TextEncoder().encode(text).byteLength > maximumBytes) {
    return {
      ok: false,
      response: apiError(
        "The request is too large.",
        "PAYLOAD_TOO_LARGE",
        413,
      ),
    };
  }
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return {
      ok: false,
      response: apiError("Invalid JSON body.", "INVALID_REQUEST", 400),
    };
  }
}
