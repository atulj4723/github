"use client";
import Bot from "@/components/Bot";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = () => {
    const { owner, repo } = useParams();
    const [files, setFiles] = useState(null);
    const [expandedDirs, setExpandedDirs] = useState([]);
    const [lastOpen, setLastOpen] = useState([]);
    const [openFile, setOpenFile] = useState();
    const [openFiles, setOpenFiles] = useState([]);
    const [loading, setLoading] = useState("Loading");
    const changeFile = (newFile) => {
        setOpenFile(newFile);
        const filteredLastOpen = lastOpen.filter((elem) => elem != newFile);
        setLastOpen([newFile, ...filteredLastOpen]);
        if (!openFiles.some((f) => f.path === newFile.path)) {
            setOpenFiles([...openFiles, newFile]);
        }
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.post("/api/get-repo-files", {
                    owner,
                    repo,
                });
                setFiles(res.data.data.files);
            } catch (e) {
                console.error(e);
                setLoading(e.response?.data?.message || "Error loading repo");
            }
        };
        fetchData();
    }, []);

    if (!files) {
        return (
            <div className="h-screen w-full flex justify-center items-center bg-gray-900 text-white">
                {loading === "Loading" ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 animate-spin border-4 border-indigo-400 border-t-transparent rounded-full"></div>
                        <div className="text-xl font-semibold text-gray-300">
                            {loading}…
                        </div>
                    </div>
                ) : (
                    <>{loading}</>
                )}
            </div>
        );
    }

    const toggleDir = (dirName) => {
        let newEx;
        if (expandedDirs.includes(dirName)) {
            newEx = expandedDirs.filter((cur) => cur != dirName);
        } else {
            newEx = [...expandedDirs, dirName];
        }
        setExpandedDirs(newEx);
    };

    const dirShow = (dir, prefix = 0) => {
        const tree = dir.map((cur) => {
            if (cur.type == "dir") {
                return (
                    <div key={cur.name} className="pl-2">
                        <div
                            onClick={() => toggleDir(cur.name)}
                            style={{ marginLeft: `${prefix * 8}px` }}
                            className="flex items-center gap-2 py-1 text-gray-300 hover:text-white cursor-pointer transition-colors">
                            <span>
                                {expandedDirs.includes(cur.name) ? "📂" : "📁"}
                            </span>
                            <span>{cur.name}</span>
                        </div>
                        {expandedDirs.includes(cur.name)
                            ? dirShow(cur.files, prefix + 1)
                            : ""}
                    </div>
                );
            } else {
                return (
                    <div
                        key={cur.name}
                        className={`pl-2 py-1 rounded-md overflow-hidden text-ellipsis whitespace-nowrap transition-colors ${
                            openFile?.path == cur.path
                                ? "bg-indigo-600 text-white"
                                : "text-gray-400 hover:bg-gray-700 hover:text-white"
                        }`}
                        style={{ marginLeft: `${prefix * 8}px` }}
                        onClick={() => {
                            changeFile(cur);
                        }}>
                        {cur.name}
                    </div>
                );
            }
        });
        return tree;
    };

    const open = () => {
        return openFile?.type === "file" || openFile?.type === "other" ? (
            <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                <code>{openFile?.content}</code>
            </pre>
        ) : openFile?.media === "image" ? (
            <img
                src={openFile?.download_url}
                className="h-full w-full object-contain m-auto rounded-lg"
            />
        ) : (
            <></>
        );
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-200">
            <div className="w-[20%] h-full p-3 text-sm overflow-auto border-r border-gray-800">
                <h2 className="font-semibold text-gray-400 mb-2">📁 Files</h2>
                {dirShow(files)}
            </div>
            <div className="h-full w-[80%] flex flex-col">
                <div className="h-[7%] bg-gray-800 text-white flex items-center overflow-auto border-b border-gray-700">
                    {openFiles.map((cur) => {
                        return (
                            <div
                                key={cur.name}
                                className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer rounded-t-md transition-colors ${
                                    cur.path == openFile?.path
                                        ? "bg-gray-900 text-indigo-400 border-b-2 border-indigo-500"
                                        : "hover:bg-gray-700"
                                }`}
                                onClick={() => {
                                    changeFile(cur);
                                }}>
                                {cur.name}
                                <button
                                    className="text-gray-400 hover:text-red-400 ml-1"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenFiles(
                                            openFiles.filter(
                                                (elem) => elem.name != cur.name
                                            )
                                        );
                                        if (openFile === cur) {
                                            if (openFiles.length != 0) {
                                                setOpenFile(lastOpen[1]);
                                            } else {
                                                setOpenFile(null);
                                            }
                                        }
                                        setLastOpen(
                                            lastOpen.filter(
                                                (elem) => elem != cur
                                            )
                                        );
                                    }}>
                                    ✕
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div className="flex-1 bg-gray-950 overflow-auto p-4 font-mono text-sm leading-relaxed">
                    {open()}
                </div>
            </div>
            <Bot
                owner={owner}
                repo={repo}
                openFile={openFile?.path}
                changeFile={changeFile}
            />
        </div>
    );
};

export default Page;
