import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import VideoCard from "../components/Videocard";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("VideoCard", () => {
  it("renders video metadata and navigates on click", () => {
    render(
      <MemoryRouter>
        <VideoCard
          video={{
            id: "1",
            title: "Building a Clone",
            thumbnail: "/thumbnail.png",
            channelName: "CodeWithDev",
            channelAvatar: "/avatar.png",
            subscribers: "1M",
            views: "100K",
            uploadedAt: "2 days ago",
            likes: "4K",
            description: "desc",
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Building a Clone")).toBeInTheDocument();
    expect(screen.getByText("CodeWithDev")).toBeInTheDocument();
    expect(screen.getByText("100K views • 2 days ago")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Building a Clone"));

    expect(mockNavigate).toHaveBeenCalledWith("/watch/1");
  });
});
