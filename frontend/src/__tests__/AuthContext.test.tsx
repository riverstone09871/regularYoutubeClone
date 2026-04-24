import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

jest.mock("../lib/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

const Consumer = () => {
  const { user, refreshUser } = useAuth();

  return (
    <div>
      <span>{user ? user.email : "guest"}</span>
      <button type="button" onClick={() => void refreshUser()}>
        Refresh
      </button>
    </div>
  );
};

describe("AuthContext", () => {
  it("loads the authenticated user on mount", async () => {
    mockedApi.get.mockResolvedValueOnce({
      id: 1,
      name: "Test User",
      email: "test@example.com",
      picture: "https://example.com/avatar.png",
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("refreshes from guest to logged-in user state", async () => {
    mockedApi.get.mockRejectedValueOnce(new Error("unauthorized"));
    mockedApi.get.mockResolvedValueOnce({
      id: 2,
      name: "Another User",
      email: "another@example.com",
      picture: "https://example.com/avatar2.png",
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("guest")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    });

    await waitFor(() => {
      expect(screen.getByText("another@example.com")).toBeInTheDocument();
    });
  });
});
