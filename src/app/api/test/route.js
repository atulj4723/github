import { octokit } from "@/lib/githubConfig";

export async function GET() {
    try {
        const res= await octokit.rest.repos.getContent({
            owner: "atulj4723",
            repo: "Spotify",
            //path: "index.html",
        });

        return Response.json(
            {
                success: true,
                data: res,
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
