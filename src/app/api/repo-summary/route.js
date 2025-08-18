import { ai } from "@/lib/geminiConfig";
import { RepoModel } from "@/models/Repo";
import axios from "axios";

export async function POST(request) {
    try {
        const { owner, repo } = await request.json();
        const { data } = await axios.post(
            "http://localhost:3000/api/get-repo-files",
            {
                owner,
                repo,
            }
        );

        const repository = await RepoModel.findOne({ owner, repo });
        if (repository?.systemPrompt) {
            return Response.json(
                {
                    success: true,
                    message: "System Prompt generated successfully.",
                    data: repository.systemPrompt,
                },
                { status: 200 }
            );
        }
        console.log("data fetched");
        const res = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `
Generate the summary of following repo:
Repo: ${repo}
Structure & Metadata:
${JSON.stringify(data, null, 2)}
Provide a clear overview of the repositorys purpose, functionality, and high-level description.
Summarize the technologies, frameworks, or languages used.
Explain the folder structure and what each key directory/file represents.
Describe the workflow or execution flow (how the project runs).
                            `,
                        },
                    ],
                },
            ],
        });
        const sys = res.candidates[0]?.content.parts[0].text;
        await RepoModel.findOneAndUpdate(
            { owner, repo },
            { $set: { systemPrompt: sys } }
        );
        return Response.json(
            {
                success: true,
                message: "System Prompt generated successfully.",
                data: sys,
            },
            { status: 200 }
        );
    } catch (e) {
        return Response.json(
            { success: false, error: e.message },
            { status: 500 }
        );
    }
}
