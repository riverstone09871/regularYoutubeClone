import type { Video } from "../types";

export const seedVideos: Video[] = [
  {
    id: "1",
    title: "Building a YouTube Clone with React",
    thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    channelName: "CodeWithDev",
    channelAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
    subscribers: "1.2M",
    views: "520K",
    uploadedAt: "2 days ago",
    likes: "12K",
    description: "In this video, we build a full YouTube clone using React and TypeScript."
  },
  {
    id: "2",
    title: "Spring Boot Full Course (Backend Deep Dive)",
    thumbnail: "https://i.ytimg.com/vi/9SGDpanrc8U/hqdefault.jpg",
    channelName: "BackendMastery",
    channelAvatar: "https://randomuser.me/api/portraits/men/2.jpg",
    subscribers: "850K",
    views: "1.1M",
    uploadedAt: "1 week ago",
    likes: "25K",
    description: "Complete backend system design and Spring Boot deep dive."
  },
  {
    id: "3",
    title: "React Native Crash Course (Expo)",
    thumbnail: "https://i.ytimg.com/vi/0-S5a0eXPoc/hqdefault.jpg",
    channelName: "MobileDev",
    channelAvatar: "https://randomuser.me/api/portraits/women/3.jpg",
    subscribers: "640K",
    views: "780K",
    uploadedAt: "5 days ago",
    likes: "18K",
    description: "Learn React Native using Expo with real-world examples."
  },
  {
    id: "4",
    title: "System Design: Netflix Architecture Explained",
    thumbnail: "https://i.ytimg.com/vi/psQzyFfsUGU/hqdefault.jpg",
    channelName: "SystemDesignPro",
    channelAvatar: "https://randomuser.me/api/portraits/men/4.jpg",
    subscribers: "2.3M",
    views: "2.8M",
    uploadedAt: "3 weeks ago",
    likes: "65K",
    description: "Deep dive into how Netflix scales to millions of users."
  },
  {
    id: "5",
    title: "AWS vs Azure vs GCP (Real Industry Use)",
    thumbnail: "/fallback-thumbnail.svg",
    channelName: "CloudTalk",
    channelAvatar: "https://randomuser.me/api/portraits/women/5.jpg",
    subscribers: "910K",
    views: "430K",
    uploadedAt: "4 days ago",
    likes: "9K",
    description: "Comparison of major cloud providers with real-world usage."
  }
];

export const videos = seedVideos;
