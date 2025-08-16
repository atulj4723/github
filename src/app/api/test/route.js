import { octokit } from "@/lib/githubConfig";

export async function GET() {
    try {
        const { data } = await octokit.rest.repos.get({
            owner: "atulj4723",
            repo: "trackeruy",
        });

        return Response.json(
            {
                success: true,
                data:data.private,
            },
            { status: 200 }
        );
    } catch (error) {
        return Response.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
