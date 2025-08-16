import dbConnect from "@/lib/dbConnet";
import { octokit } from "@/lib/githubConfig";
import { RepoModel } from "@/models/Repo";

function getMediaType(filename) {
    const ext = filename.toLowerCase();
    if ([".mp3", ".wav", ".flac"].some((e) => ext.endsWith(e))) return "audio";
    if ([".mp4", ".mov", ".avi", ".mkv"].some((e) => ext.endsWith(e)))
        return "video";
    if (
        [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].some((e) =>
            ext.endsWith(e)
        )
    )
        return "image";
    if (ext.endsWith(".pdf")) return "pdf";
    if (ext.endsWith(".docx")) return "docx";
    if ([".ppt", ".pptx"].some((e) => ext.endsWith(e))) return "ppt";
    if ([".md", ".txt", ".json"].some((e) => ext.endsWith(e))) return "text";
    return "other";
}

const fetchData = async (owner, repo, path) => {
    const response = await octokit.rest.repos.getContent({ owner, repo, path });
    const { data, headers } = response;

    let lastModified = headers["last-modified"] || new Date();
    console.log(path);
    if (!Array.isArray(data)) {
        const type = getMediaType(data.name);
        if (type === "other" || type === "text") {
            return {
                name: data.name,
                type: "file",
                path: data.path,
                content: Buffer.from(data.content, "base64").toString("utf-8"),
                lastModified,
            };
        }
        return {
            name: data.name,
            type: "media",
            media: type,
            path: data.path,
            download_url: data.download_url,
            lastModified,
        };
    }

    const children = [];
    for (const elem of data) {
        children.push(await fetchData(owner, repo, elem.path));
    }

    const name = path.split("/");
    return {
        name: name[name.length - 1] || repo,
        type: "dir",
        path,
        files: children,
        lastModified,
    };
};

export async function POST(request) {
    try {
        await dbConnect();
        const { owner, repo } = await request.json();
        if (!owner || !repo) {
            return Response.json(
                { success: false, message: "'owner' and 'repo' are required" },
                { status: 400 }
            );
        }
        const { data } = await octokit.rest.repos.get({ owner, repo });
        if (data.private) {
            return Response.json(
                { success: false, message: "The repository should be public." },
                { status: 400 }
            );
        }
        const { headers } = await octokit.rest.repos.getContent({
            owner,
            repo,
        });

        const res = await RepoModel.findOne({ owner, repo });

        if (
            new Date(res?.lastModified).getTime() ===
            new Date(headers["last-modified"]).getTime()
        ) {
            return Response.json(
                {
                    success: true,
                    message: "Data successfully retrived.",
                    data: res.files,
                },
                { status: 200 }
            );
        }
        const repoData = await fetchData(owner, repo, "");

        await RepoModel.findOneAndUpdate(
            { owner, repo },
            {
                owner,
                repo,
                lastModified: repoData.lastModified,
                files: repoData,
            },
            { upsert: true, new: true }
        );

        return Response.json(
            {
                success: true,
                message: "Data successfully retrived.",
                data: repoData,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in POST /api/repo-data:", error);
        return Response.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
