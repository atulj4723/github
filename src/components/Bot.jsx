"use client";
import axios from "axios";
import { marked } from "marked";
import React, { useState, useRef, useEffect } from "react";

const Bot = ({ owner, repo, openFile, changeFile }) => {
    const [openChat, setOpenChat] = useState(false);
    const [chat, setChat] = useState([
        {
            role: "model",
            parts: [
                {
                    text: "Hello! I'm your AI assistant for this repository. How can I help you?",
                },
            ],
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    }, [chat]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const newChat = [...chat, { role: "user", parts: [{ text: input }] }];
        setChat(newChat);
        setInput("");
        setIsLoading(true);
        const oldOpenFile = openFile;
        try {
            const response = await axios.post("/api/ai-response", {
                owner,
                repo,
                conversation: newChat,
                openFile,
            });
            if (
                oldOpenFile !== response.data.openFile &&
                response.data.openFile
            ) {
                const { data } = await axios.get("/api/get-repo-file", {
                    params: {
                        owner,
                        repo,
                        path: response.data.openFile,
                    },
                });
                changeFile(data.data);
            }
            setChat(response.data.message);
        } catch (e) {
            console.error("API error:", e.message);
            const errorResponse = {
                role: "model",
                parts: [
                    {
                        text: "Sorry, I encountered an error. Please try again.",
                    },
                ],
            };
            setChat((prevChat) => [...prevChat, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button
                className="text-xl bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 transition-transform hover:scale-110"
                onClick={() => setOpenChat(!openChat)}>
                {openChat ? "✕" : "🤖"}
            </button>
            {openChat && (
                <div className="absolute bottom-16 right-0 h-[75vh] w-96 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
                    <div className="bg-gray-800 text-white p-4 font-semibold text-lg flex items-center gap-3 border-b border-gray-700">
                        <span className="text-2xl">🤖</span> AI Assistant
                    </div>
                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950">
                        {chat.map((cur, idx) =>
                            cur.parts[0].text ? (
                                cur.role === "user" ? (
                                    <div
                                        key={idx}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl max-w-[85%] w-fit ml-auto shadow-md">
                                        {cur.parts[0].text}
                                    </div>
                                ) : (
                                    <div
                                        key={idx}
                                        dangerouslySetInnerHTML={{
                                            __html: marked.parse(
                                                cur.parts[0].text
                                            ),
                                        }}
                                        className="prose prose-invert prose-sm bg-gray-800 text-gray-300 px-4 py-2 rounded-xl max-w-[85%] shadow-md"></div>
                                )
                            ) : null
                        )}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-800 px-4 py-3 rounded-xl max-w-[85%] shadow-md">
                                    <div className="flex items-center space-x-2">
                                        <div
                                            className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                                            style={{
                                                animationDelay: "0s",
                                            }}></div>
                                        <div
                                            className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                                            style={{
                                                animationDelay: "0.2s",
                                            }}></div>
                                        <div
                                            className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                                            style={{
                                                animationDelay: "0.4s",
                                            }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center p-2 border-t border-gray-700 bg-gray-900">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 p-3 bg-gray-800 text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Ask a question..."
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-r-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed"
                            disabled={isLoading}>
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bot;
