import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../context/AuthProvider";
import { useAuth } from "../context/auth";
import authService from "../services/authService";

vi.mock("../services/authService", () => ({
  default: {
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);
  });

  it("termina la carga sin sesion", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.userProfile).toBeNull();
  });

  it("restaura la sesion desde /api/me", async () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      rol: "presidente",
    } as never);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.userProfile).toBe("presidente");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("login y logout actualizan el estado derivado", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.login("vecino"));
    expect(result.current.userProfile).toBe("vecino");
    expect(result.current.isAuthenticated).toBe(true);

    act(() => result.current.logout());
    expect(result.current.userProfile).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(authService.logout).toHaveBeenCalled();
  });

  it("alterna el tema", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isDarkMode).toBe(false);
    act(() => result.current.toggleTheme());
    expect(result.current.isDarkMode).toBe(true);
  });
});
