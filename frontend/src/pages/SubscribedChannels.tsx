// src/pages/subscribedChannels.tsx

import { useEffect, useState } from "react";

type Channel = string;

export default function SubscribedChannels() {
    const [channelsList, setChannelsList] = useState<Channel[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSubscribedChannels();
    }, []);

    const fetchSubscribedChannels = async () => {
        try {
            const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

            console.log("User object:", currentUser);
            console.log("User keys:", Object.keys(currentUser));

            const userId = currentUser?.id; // Update this once the correct field is identified

            if (!userId) {
                console.error("No userId found");
                setIsLoading(false);
                return;
            }

            const response = await fetch(
                `http://localhost:8080/api/subscriptions/channels?userId=${userId}`,
                {
                    method: "GET",
                    credentials: "include" // if using auth cookies
                }
            );

            console.log("Status:", response.status);

            if (!response.ok) {
                throw new Error("Failed to fetch channels");
            }

            const responseData = await response.json();
            console.log("Data from backend:", responseData);
            setChannelsList(responseData);
        } catch (error) {
            console.error("Error fetching channels:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div>Loading subscribed channels...</div>;
    }

    return (
        <ul>
            {channelsList.map((channelName, index) => (
                <li key={index} style={{ marginBottom: "10px" }}>
                    {channelName}
                </li>
            ))}
        </ul>
    );
}