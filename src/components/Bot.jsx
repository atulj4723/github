"use client";
import React, { useState } from "react";

const Bot = () => {
    const [openChat, setOpenChat] = useState(true);
    const [chat, setChat] = useState([
        { role: "model", parts: [{ text: "Hello! How can I help you?" }] },
    ]);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;

        const newChat = [...chat, { role: "user", parts: [{ text: input }] }];
        setChat(newChat);
        setInput("");
    };

    return (
        <div className="fixed bottom-4 right-4">
            
            <h1
                className="text-2xl bg-gray-100 rounded-full h-fit w-fit p-1.5 cursor-pointer shadow"
                onClick={() => setOpenChat(!openChat)}>
                {openChat ? "❌" : "🤖"}
            </h1>

            {openChat && (
                <div className="h-[40vh] w-80 bg-white  rounded-lg flex flex-col overflow-hidden">
                    
                    <div className="flex-1 overflow-y-auto p-2  bg-gray-50">
                        {chat.map((cur, idx) =>
                            cur.role === "user" ? (
                                <div
                                    key={idx}
                                    className="bg-blue-500 text-white p-2 rounded-lg self-end ml-auto max-w-[80%] w-fit">
                                    {cur.parts[0].text}
                                </div>
                            ) : (
                                <div
                                    key={idx}
                                    className="bg-gray-300 text-black p-2 rounded-lg self-start mr-auto max-w-[80%] w-fit">
                                    {cur.parts[0].text}
                                </div>
                            )
                        )}
                    </div>

                
                    <div className="flex border-t">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-[80%] p-2 outline-none text-black"
                            placeholder="Type a message..."
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            className="w-[20%] bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700">
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bot;
