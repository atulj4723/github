import { ai } from "@/lib/geminiConfig.js";
import axios from "axios";

export async function POST(request) {
    let { conversation, owner, repo, openFile = "" } = await request.json();
    const state = { openFile }; // wrapper object ✅

    const toolFunctions = {
        getFileContent: async ({ owner, repo, filePath }) => {
            const res = await axios.get(
                "http://localhost:3000/api/get-repo-file",
                { params: { owner, repo,path: filePath } }
            );
            return res.data.data;
        },
        getCurrentOpenFile: async () => {
            return state.openFile;
        },
        changeCurrentOpenFile: async ({ newFile }) => {
            console.log("change:", newFile);
            state.openFile = newFile; // ✅ persist inside wrapper
            return state.openFile;
        },
    };

    const processRes = async (conversation, systemInstruction, retries) => {
        console.log(JSON.stringify(conversation));
        const res = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: conversation,
            config: {
                systemInstruction,
                tools: [
                    {
                        functionDeclarations: [
                            {
                                name: "getFileContent",
                                description: "Get a repo file content",
                                parameters: {
                                    type: "object",
                                    properties: {
                                        owner: { type: "string" },
                                        repo: { type: "string" },
                                        filePath: { type: "string" },
                                    },
                                    required: ["owner", "repo", "filePath"],
                                },
                            },
                            {
                                name: "getCurrentOpenFile",
                                description: "Returns the current open file",
                                parameters: { type: "object", properties: {} },
                            },
                            {
                                name: "changeCurrentOpenFile",
                                description: "Changes the current open file",
                                parameters: {
                                    type: "object",
                                    properties: {
                                        newFile: { type: "string" },
                                    },
                                    required: ["newFile"],
                                },
                            },
                        ],
                    },
                ],
            },
        });

        const functionCall =
            res.candidates[0]?.content?.parts?.[0]?.functionCall;

        if (functionCall) {
            const { name, args } = functionCall;
            const toolFn = toolFunctions[name];
            if (!toolFn) {
                conversation.push({
                    role: "model",
                    parts: [{ text: `❌ Unknown tool function: ${name}` }],
                });
                return await processRes(conversation, data, retries + 1);
            }

            const result = await toolFn(args);
            conversation.push({ role: "model", parts: [{ functionCall }] });
            conversation.push({
                role: "user",
                parts: [{ functionResponse: { name, response: { result } } }],
            });
            return await processRes(conversation, systemInstruction, retries + 1);
        } else {
            const text = res.candidates[0]?.content?.parts?.[0]?.text;
            conversation.push({ role: "model", parts: [{ text }] });
            return conversation;
        }
    };

    const { data } = await axios.post(
        "http://localhost:3000/api/repo-summary",
        { owner, repo }
    );
    const systemInstruction = `
You are an AI Coding Assistant specialized in the following GitHub repository:
owner=${owner}
repo=${repo}
summary=${data.data}
UI / Interaction Instructions
Never dump raw file content in chat.
While explaining any file strictly open that file in side panel.
When a file is opened, display its content in the side panel, not the chat.
Use changeCurrentOpenFile function to open the file in side panel.Do not add / infront of path.like /tools/.. these is wrong.Correct way is tools/..
Use the folder structure to locate files before answering.
Keep responses professional, structured, and developer-focused.
give simple short answers.do not give long answers.
`;
    try {
        const res = await processRes(conversation, systemInstruction, 0);
        console.log("FINAL openFile:", state.openFile); // ✅ now updated
        return Response.json(
            { success: true, message: res, openFile: state.openFile },
            { status: 200 }
        );
    } catch (e) {
        console.error("Gemini error:", e.message);
        return Response.json(
            { success: false, error: e.message },
            { status: 500 }
        );
    }
}
