import dbConnect from "@/lib/dbConnet";
import { RepoModel } from "@/models/Repo";

function findFile(files, targetPath) {
    if (!files) return null;

    if (files.type === "file" && files.path === targetPath) {
        return files;
    }

    if (files.type === "dir" && Array.isArray(files.files)) {
        for (const child of files.files) {
            const result = findFile(child, targetPath);
            if (result) return result;
        }
    }

    return null;
}

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const owner = searchParams.get("owner");
        const repo = searchParams.get("repo");
        const filePath = searchParams.get("path");
        console.log(filePath);
        if (!owner || !repo || !filePath) {
            return Response.json(
                {
                    success: false,
                    message: "'owner', 'repo', and 'path' are required",
                },
                { status: 400 }
            );
        }

        const repoDoc = await RepoModel.findOne({ owner, repo });

        if (!repoDoc) {
            return Response.json(
                {
                    success: false,
                    message: "Repository not found in DB. Please sync first.",
                },
                { status: 404 }
            );
        }

        const fileData = findFile(repoDoc.files, filePath);

        if (!fileData) {
            return Response.json(
                {
                    success: false,
                    message: "File not found in repository data.",
                },
                { status: 404 }
            );
        }

        return Response.json(
            { success: true, data: fileData },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in GET /api/repo-file:", error);
        return Response.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

