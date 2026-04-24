import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Watch from "../pages/Watch";
import { api } from "../lib/api";
import { loadVideos } from "../lib/videos";

jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: 1,
      name: "Tester",
      email: "tester@example.com",
      picture: "https://example.com/avatar.png",
    },
  }),
}));

jest.mock("../lib/api", () => ({
  API_BASE_URL: "http://localhost:8080",
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock("../lib/videos", () => ({
  loadVideos: jest.fn(),
}));

const mockedApi = api as jest.Mocked<typeof api>;
const mockedLoadVideos = loadVideos as jest.MockedFunction<typeof loadVideos>;

const baseVideo = {
  id: "1",
  title: "Watch Test Video",
  thumbnail: "/thumb.png",
  channelName: "CodeWithDev",
  channelAvatar: "/avatar.png",
  subscribers: "1M",
  views: "42K",
  uploadedAt: "1 day ago",
  likes: "2K",
  description: "Video description",
};

const existingComment = {
  id: 7,
  videoId: "1",
  text: "Great walkthrough",
  createdAt: "2026-04-23T10:00:00Z",
  parentCommentId: null,
  likes: 0,
  dislikes: 0,
  user: {
    id: 3,
    name: "Commenter",
    email: "commenter@example.com",
    picture: "https://example.com/commenter.png",
  },
};

describe("Watch page comments", () => {
  beforeEach(() => {
    mockedLoadVideos.mockResolvedValue([baseVideo, { ...baseVideo, id: "2", title: "Next Video" }]);
    mockedApi.get.mockImplementation(async (path: string) => {
      if (path === "/api/comments/1") {
        return [existingComment];
      }
      if (path === "/api/subscriptions") {
        return { subscribedChannelIds: [] };
      }
      return [];
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  function renderPage() {
    return render(
      <MemoryRouter initialEntries={["/watch/1"]}>
        <Routes>
          <Route path="/watch/:videoId" element={<Watch />} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it("adds a new top-level comment", async () => {
    mockedApi.post.mockImplementation(async (path: string) => {
      if (path === "/api/comments") {
        return {
          id: 9,
          videoId: "1",
          text: "New comment",
          createdAt: "2026-04-23T12:00:00Z",
          parentCommentId: null,
          likes: 0,
          dislikes: 0,
          user: existingComment.user,
        };
      }
      throw new Error(`Unexpected path ${path}`);
    });

    renderPage();

    await screen.findByRole("heading", { name: "Comments" });

    fireEvent.change(screen.getByPlaceholderText("Add a comment..."), {
      target: { value: "New comment" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Post comment" }));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith("/api/comments", {
        videoId: "1",
        text: "New comment",
        parentCommentId: null,
      });
    });

    expect(await screen.findByText("New comment")).toBeInTheDocument();
  });

  it("likes a comment and submits a reply", async () => {
    mockedApi.post.mockImplementation(async (path: string) => {
      if (path === "/api/comments/7/like") {
        return {
          ...existingComment,
          likes: 1,
        };
      }

      if (path === "/api/comments/7/reply") {
        return {
          id: 10,
          videoId: "1",
          text: "Reply body",
          createdAt: "2026-04-23T12:30:00Z",
          parentCommentId: 7,
          likes: 0,
          dislikes: 0,
          user: existingComment.user,
        };
      }

      throw new Error(`Unexpected path ${path}`);
    });

    renderPage();

    await screen.findByText("Great walkthrough");

    fireEvent.click(screen.getByRole("button", { name: "Like comment 7" }));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith("/api/comments/7/like");
    });

    fireEvent.click(screen.getByRole("button", { name: "Reply to comment 7" }));
    fireEvent.change(screen.getByPlaceholderText("Write a reply"), {
      target: { value: "Reply body" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Post reply" }));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith("/api/comments/7/reply", {
        videoId: "1",
        text: "Reply body",
      });
    });

    expect(await screen.findByText("Reply body")).toBeInTheDocument();
  });
});
