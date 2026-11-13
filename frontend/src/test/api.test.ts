import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import api from "../api";

const fetchMock = vi.fn();

const okResponse = () => ({
  status: 200,
  ok: true,
  headers: { forEach: () => {} },
  json: async () => ({ ok: true }),
  blob: async () => new Blob(),
});

describe("api", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    });
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(okResponse());
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("deja que el navegador genere el boundary de FormData", async () => {
    const formData = new FormData();
    formData.append("username", "14306046-2");

    await api.post("/api/token", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers["Content-Type"]).toBeUndefined();
  });

  it("usa application/json para un body normal", async () => {
    await api.post("/api/algo", { a: 1 });

    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
  });
});
