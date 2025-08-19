"use client";
import Bot from "@/components/Bot";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";

const getFileExtension = (filename) => {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};
const fileIcons = {
    js: "📜",
    jsx: "⚛️",
    css: "🎨",
    json: "📦",
    md: "📝",
    png: "🖼️",
    jpg: "🖼️",
    jpeg: "🖼️",
    gif: "🖼️",
    svg: "🖼️",
    mp3: "🎵",
    mp4: "🎬",
    default: "📄",
};

const Page = () => {
    const { owner, repo } = useParams();
    const [files, setFiles] = useState(null);
    const [expandedDirs, setExpandedDirs] = useState([]);
    const [lastOpen, setLastOpen] = useState([]);
    const [openFile, setOpenFile] = useState();
    const [openFiles, setOpenFiles] = useState([]);
    const [loading, setLoading] = useState("Loading");
    const tabsContainerRef = useRef(null);
    useEffect(() => {
        if (openFile) {
            document.title = `${openFile.name} - ${owner}/${repo}`;
            const activeTab = tabsContainerRef.current?.querySelector(
                `[data-path="${openFile.path}"]`
            );
            if (activeTab) {
                activeTab.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center",
                });
            }
        } else {
            document.title = `${owner}/${repo} - GitHub Explain`;
        }
    }, [openFile, owner, repo]);

    const changeFile = (newFile) => {
        setOpenFile(newFile);
        const filteredLastOpen = lastOpen.filter(
            (elem) => elem.path !== newFile.path
        );
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
    }, [owner, repo]);

    if (!files) {
        return (
            <div className="h-screen w-full flex justify-center items-center bg-gray-950 text-white">
                {loading === "Loading" ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 animate-spin border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                        <div className="text-xl font-semibold text-gray-400 mt-4">
                            {loading} your repository...
                        </div>
                    </div>
                ) : (
                    <div className="text-2xl text-red-500 bg-gray-800 p-6 rounded-lg shadow-xl">
                        Error: {loading}
                    </div>
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
        return dir.map((cur) => {
            const isExpanded = expandedDirs.includes(cur.name);
            const icon =
                cur.type === "dir"
                    ? isExpanded
                        ? "📂"
                        : "📁"
                    : fileIcons[getFileExtension(cur.name)] ||
                      fileIcons.default;

            if (cur.type === "dir") {
                return (
                    <div key={cur.path} className="text-sm">
                        <div
                            onClick={() => toggleDir(cur.name)}
                            style={{ paddingLeft: `${prefix * 8}px` }}
                            className="flex items-center gap-2 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer transition-colors rounded-md">
                            <span>{icon}</span>
                            <span className="font-medium">{cur.name}</span>
                        </div>
                        {isExpanded && (
                            <div className="border-l border-gray-700 ml-4">
                                {dirShow(cur.files, prefix + 1)}
                            </div>
                        )}
                    </div>
                );
            } else {
                return (
                    <div
                        key={cur.path}
                        className={`flex items-center gap-2 py-1.5 rounded-md overflow-hidden text-ellipsis whitespace-nowrap transition-colors cursor-pointer text-sm ${
                            openFile?.path === cur.path
                                ? "bg-indigo-600 text-white font-semibold"
                                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                        style={{ paddingLeft: `${prefix * 8}px` }}
                        onClick={() => changeFile(cur)}>
                        <span>{icon}</span>
                        <span>{cur.name}</span>
                    </div>
                );
            }
        });
    };

    const closeFile = (fileToClose) => {
        const newOpenFiles = openFiles.filter(
            (f) => f.path !== fileToClose.path
        );
        setOpenFiles(newOpenFiles);

        const newLastOpen = lastOpen.filter((f) => f.path !== fileToClose.path);
        setLastOpen(newLastOpen);

        if (openFile?.path === fileToClose.path) {
            setOpenFile(newLastOpen[0] || null);
        }
    };

    const open = () => {
        if (!openFile) {
            return (
                <div className="h-full flex flex-col justify-center items-center text-gray-500">
                    <div className="text-5xl mb-4">🖥️</div>
                    <h2 className="text-2xl font-semibold">
                        Welcome to the Code Viewer
                    </h2>
                    <p className="mt-2 text-lg">
                        Select a file from the sidebar to begin.
                    </p>
                </div>
            );
        }

        return openFile?.type === "file" || openFile?.type === "other" ? (
            <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed p-4 bg-gray-900 rounded-lg">
                <code>{openFile?.content}</code>
            </pre>
        ) : openFile?.media === "image" ? (
            <div className="h-full w-full flex items-center justify-center p-4">
                <img
                    src={openFile?.download_url}
                    alt={openFile.name}
                    className="max-h-full max-w-full object-contain m-auto rounded-lg shadow-lg"
                />
            </div>
        ) : openFile?.media === "video" ? (
            <div className="h-full w-full flex items-center justify-center p-4">
                <video
                    src={openFile?.download_url}
                    controls
                    className="max-h-full max-w-full object-contain m-auto rounded-lg shadow-lg"
                />
            </div>
        ) : openFile?.media === "audio" ? (
            <div className="w-full h-full flex justify-center items-center p-4">
                <audio
                    src={openFile?.download_url}
                    controls
                    className="w-1/2"
                />
            </div>
        ) : (
            <div className="h-full flex justify-center items-center text-gray-500">
                Unsupported file type.
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-gray-950 text-gray-200 font-sans">
            <aside className="w-[22%] h-full p-4 text-sm overflow-y-auto bg-gray-900 border-r border-gray-800 shadow-inner">
                <h2 className="font-bold text-lg text-white mb-4 px-2">
                    {repo}
                </h2>
                <div className="space-y-1">{dirShow(files)}</div>
            </aside>
            <main className="h-full w-[78%] flex flex-col">
                <div
                    ref={tabsContainerRef}
                    className="bg-gray-900 text-white flex items-center overflow-x-auto border-b border-gray-800 shadow-md">
                    {openFiles.map((cur) => (
                        <div
                            key={cur.path}
                            data-path={cur.path}
                            className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer border-b-2 transition-all duration-200 ease-in-out flex-shrink-0 ${
                                cur.path === openFile?.path
                                    ? "bg-gray-800 text-indigo-400 border-indigo-500"
                                    : "border-transparent hover:bg-gray-800/50"
                            }`}
                            onClick={() => changeFile(cur)}>
                            <span>
                                {fileIcons[getFileExtension(cur.name)] ||
                                    fileIcons.default}
                            </span>
                            <span className="text-sm font-medium">
                                {cur.name}
                            </span>
                            <button
                                className="text-gray-500 hover:text-red-400 ml-2 text-lg leading-none"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeFile(cur);
                                }}>
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex-1 bg-gray-950 overflow-auto p-6">
                    {open()}
                </div>
            </main>
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
