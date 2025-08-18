"use client";
import axios from "axios";
import React, { useState, useRef, useEffect } from "react";

const Bot = ({ owner, repo, openFile, changeFile }) => {
    const [openChat, setOpenChat] = useState(false);
    const [chat, setChat] = useState([
        { role: "model", parts: [{ text: "Hello! How can I help you?" }] },
    ]);
    const [input, setInput] = useState("");
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    }, [chat]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const newChat = [...chat, { role: "user", parts: [{ text: input }] }];
        setChat(newChat);
        setInput("");
        const oldOpenFile = openFile;
        try {
            const response = await axios.post("/api/ai-response", {
                owner,
                repo,
                conversation: newChat,
                openFile,
            });
            if (oldOpenFile != response.data.openFile) {
                if (response.data.openFile) {
                    const { data } = await axios.get("/api/get-repo-file", {
                        params: {
                            owner,
                            repo,
                            path: response.data?.openFile,
                        },
                    });
                    changeFile(data.data);
                }
            }
            setChat(response.data.message);
        } catch (e) {
            console.error("Streaming error:", e.message);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button
                className="text-3xl bg-blue-600 text-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
                onClick={() => setOpenChat(!openChat)}>
                {openChat ? "❌" : "🤖"}
            </button>
            {openChat && (
                <div className="mt-3 h-[70vh] w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
                    <div className="bg-blue-600 text-white p-3 font-semibold text-lg">
                        AI Assistant
                    </div>
                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                        {chat.map((cur, idx) =>
                            cur.role === "user" ? (
                                <div
                                    key={idx}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-2xl max-w-[80%] ml-auto shadow">
                                    {cur.parts[0].text}
                                </div>
                            ) : (
                                <div
                                    key={idx}
                                    className="bg-gray-200 text-black px-4 py-2 rounded-2xl max-w-[80%] shadow">
                                    {cur.parts[0].text}
                                </div>
                            )
                        )}
                    </div>
                    <div className="flex border-t bg-white">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 p-3 outline-none text-black rounded-bl-2xl"
                            placeholder="Type a message..."
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            className="px-5 bg-blue-600 text-white font-medium rounded-br-2xl hover:bg-blue-700 transition">
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bot;
