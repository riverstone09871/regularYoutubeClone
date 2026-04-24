export type AuthUser = {
  id: number;
  name: string;
  email: string;
  picture: string;
  authProvider?: string;
};

export type Video = {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelAvatar: string;
  subscribers: string;
  views: string;
  uploadedAt: string;
  likes: string;
  description: string;
};

export type ApiVideo = {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelName: string;
  createdAt: string;
  user?: AuthUser | null;
};

export type VideoComment = {
  id: number;
  videoId: string;
  text: string;
  createdAt: string;
  parentCommentId: number | null;
  likes: number;
  dislikes: number;
  user?: AuthUser | null;
};
