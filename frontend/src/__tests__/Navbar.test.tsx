import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../components/Navbar";

const mockUseAuth = jest.fn();

jest.mock("../context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("../lib/api", () => ({
  API_BASE_URL: "http://localhost:8080",
  api: {
    post: jest.fn(),
  },
}));

describe("Navbar", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        picture: "https://example.com/avatar.png",
        authProvider: "local",
      },
      refreshUser: jest.fn(),
    });
  });

  it("opens the profile dropdown and closes it when clicking outside", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    const avatarButton = screen.getByAltText("Test User").closest("button");
    expect(avatarButton).not.toBeNull();
    fireEvent.click(avatarButton!);

    expect(screen.getByText("Subscriptions")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByText("Subscriptions")).not.toBeInTheDocument();
  });
});
