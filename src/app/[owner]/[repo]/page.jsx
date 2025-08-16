"use client";
import Bot from "@/components/Bot";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = () => {
    const { owner, repo } = useParams();
    const [files, setFiles] = useState([]);
    const [expandedDirs, setExpandedDirs] = useState([]);
    const [lastOpen, setLastOpen] = useState([]);
    const [openFile, setOpenFile] = useState();
    const [openFiles, setOpenFiles] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.post("/api/get-repo-files", {
                    owner,
                    repo,
                });
                setFiles(res.data.data.files);
                console.log(res.data.data);
            } catch (e) {
                console.error(e);
            }
        };
       // fetchData();
    }, []);

    const toggleDir = (dirName) => {
        let newEx;
        if (expandedDirs.includes(dirName)) {
            newEx = expandedDirs.filter((cur) => {
                return cur != dirName;
            });
        } else {
            newEx = [...expandedDirs, dirName];
        }
        setExpandedDirs(newEx);
    };
    const dirShow = (dir, prefix = 0) => {
        const tree = dir.map((cur, idx) => {
            if (cur.type == "dir") {
                return (
                    <div className="border-l-1 pl-1">
                        <div
                            onClick={() => {
                                toggleDir(cur.name);
                            }}
                            style={{ marginLeft: `${prefix * 8}px` }}>
                            {expandedDirs.includes(cur.name) ? "📂" : "📁"}
                            {cur.name}
                        </div>
                        {expandedDirs.includes(cur.name)
                            ? dirShow(cur.files, prefix + 1)
                            : ""}
                    </div>
                );
            } else {
                return (
                    <div
                        className={`border-l-1 pl-1 ${
                            openFile === cur ? "bg-gray-500" : ""
                        }`}
                        onClick={() => {
                            setOpenFile(cur);
                            const filteredLastOpen = lastOpen.filter((elem) => {
                                return elem != cur;
                            });
                            setLastOpen([cur, ...filteredLastOpen]);
                            if (!openFiles.includes(cur)) {
                                setOpenFiles([...openFiles, cur]);
                            }
                        }}
                        style={{ marginLeft: `${prefix * 8}px` }}>
                        {cur.name}
                    </div>
                );
            }
        });
        return tree;
    };
    const open = () => {
        return openFile?.type === "file" || openFile?.type === "other" ? (
            <pre className="whitespace-pre-wrap text-sm">
                <code>{openFile?.content}</code>
            </pre>
        ) : openFile?.media === "image" ? (
            <img src={openFile?.download_url} className="h-[100%] w-[100%] object-contain m-auto"/>
        ) : (
            <>{JSON.stringify(openFile)}</>
        );
    };
    return (
        <div className="flex">
            <div className="w-[20%] h-[100vh] pl-2 cursor-pointer text-sm overflow-auto">
                {dirShow(files)}
            </div>
            <div className=" h-[100vh] w-[80%]">
                <div className="h-[5%] bg-blue-950 text-white w-full flex pl-1 cursor-pointer  overflow-auto">
                    {openFiles.map((cur) => {
                        return (
                            <div
                                className={`flex  border-r-[0.5px] gap-1 ${
                                    cur == openFile
                                        ? "border-t-blue-400 border-t-4"
                                        : ""
                                }  p-0.5 pl-1 pr-1`}
                                onClick={() => {
                                    setOpenFile(cur);
                                    const filteredLastOpen = lastOpen.filter(
                                        (elem) => {
                                            return elem != cur;
                                        }
                                    );
                                    setLastOpen([cur, ...filteredLastOpen]);
                                    console.log(lastOpen);
                                }}>
                                {cur.name}
                                <div
                                    className=""
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenFiles(
                                            openFiles.filter((elem) => {
                                                return elem.name != cur.name;
                                            })
                                        );
                                        console.log(lastOpen);
                                        if (openFile === cur) {
                                            if (openFiles.length != 0) {
                                                setOpenFile(lastOpen[1]);
                                            } else {
                                                setOpenFile(null);
                                            }
                                        }
                                        setLastOpen(
                                            lastOpen.filter((elem) => {
                                                return elem != cur;
                                            })
                                        );
                                    }}>
                                    X
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="h-[95%] bg-gray-700 overflow-auto text-white p-4">
                    {open()}
                </div>
            </div>
            <Bot/>
        </div>
    );
};

export default Page;
