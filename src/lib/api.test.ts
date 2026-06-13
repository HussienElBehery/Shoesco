import { describe, expect, it } from "vitest";

import { readJsonBody } from "@/lib/api";

describe("readJsonBody", () => {
  it("parses valid JSON within the request limit", async () => {
    const result = await readJsonBody(
      new Request("http://localhost/api/test", {
        method: "POST",
        body: JSON.stringify({ ok: true }),
      }),
      1024,
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual({ ok: true });
  });

  it("returns a safe error for malformed JSON", async () => {
    const result = await readJsonBody(
      new Request("http://localhost/api/test", {
        method: "POST",
        body: "{broken",
      }),
      1024,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      await expect(result.response.json()).resolves.toEqual({
        error: "Invalid JSON body.",
        code: "INVALID_REQUEST",
      });
    }
  });

  it("rejects declared and actual oversized payloads", async () => {
    const declared = await readJsonBody(
      new Request("http://localhost/api/test", {
        method: "POST",
        headers: { "content-length": "2000" },
        body: "{}",
      }),
      100,
    );
    const actual = await readJsonBody(
      new Request("http://localhost/api/test", {
        method: "POST",
        body: JSON.stringify({ value: "x".repeat(200) }),
      }),
      100,
    );

    expect(declared.ok).toBe(false);
    expect(actual.ok).toBe(false);
    if (!declared.ok) expect(declared.response.status).toBe(413);
    if (!actual.ok) expect(actual.response.status).toBe(413);
  });
});
