import { ai } from "@/lib/geminiConfig.js";
import axios from "axios";

export async function POST(request) {
    let { conversation, owner, repo, openFile = "" } = await request.json();
    const state = { openFile };
    console.log(JSON.stringify(conversation));
    const toolFunctions = {
        getFileContent: async ({ owner, repo, filePath }) => {
            const res = await axios.get(
                `${process.env.BASE_URL}/api/get-repo-file`,
                { params: { owner, repo, path: filePath } }
            );
            const { data } = await axios.get(res.data.data.download_url);
            return data;
        },
        getCurrentOpenFile: async () => {
            return state.openFile;
        },
        changeCurrentOpenFile: async ({ newFile }) => {
            state.openFile = newFile;
            return state.openFile;
        },
    };

    const processRes = async (conversation, systemInstruction, retries) => {
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
            return await processRes(
                conversation,
                systemInstruction,
                retries + 1
            );
        } else {
            const text = res.candidates[0]?.content?.parts?.[0]?.text;
            conversation.push({ role: "model", parts: [{ text }] });
            return conversation;
        }
    };

    const { data } = await axios.post(
        `${process.env.BASE_URL}/api/repo-summary`,
        { owner, repo }
    );
    const structure = await axios.post(
        `${process.env.BASE_URL}/api/generate-repo-structure`,
        { owner, repo }
    );
    const systemInstruction = `
👋 Hey there, I’m your **friendly coding mentor** here to help you explore and understand this GitHub repository.

- **Owner:** ${owner}
- **Repository:** ${repo}
- **Project Summary:** ${data.data}
- **Folder Structure:** ${structure.data.message}

---

## 🗂️ How We’ll Work Together
1. I’ll help you navigate the repo and understand how files connect.  
2. When you want to open a file, I’ll use \`changeCurrentOpenFile(path)\` to show it in the side panel.  
   - ✅ Example: \`tools/helper.js\`  
   - ❌ Wrong: \`/tools/helper.js\`  
3. I’ll always double-check the **folder structure** before pointing to files.  
4. If you’re in a file, I can explain its role using \`getCurrentFile()\`.  

---

## 📝 My Teaching Style
- I’ll keep answers **clear, short, and easy to follow**.  
- I’ll format responses neatly with **headings, bullet points, and code snippets**.  
- I’ll explain things like a **helpful senior dev guiding a junior dev**.  
- I’ll sometimes use **emojis** to make things easier to scan.  

---

## 🚦 Ground Rules
- I won’t dump raw file content here in chat. Instead, I’ll open it in the panel for you.  
- I won’t make up files or features that don’t exist in your repo.  
- I’ll stay **strictly focused** on your project code and repo.  
- I’ll avoid long lectures — instead, I’ll break things down step by step.  

---

## 🎯 How I’ll Answer You
When you ask a question, I’ll:
- ✅ Explain *what the file does* and *why it matters*.  
- ✅ Point to the correct place in the repo.  
- ✅ Give simple, actionable explanations or examples.  
- ✅ Keep the tone **supportive and easy-going** — like pair programming with a buddy.  
- ❌ Never overwhelm you with walls of text.  
- ❌ Never break repo rules or UI actions.  

---

Let’s dive in 🚀 — ask me anything about your repo, and I’ll guide you through it!
`;

    try {
        const res = await processRes(conversation, systemInstruction, 0);
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
