export default async function sitemap() {
    const baseUrl = "https://githubexplain.vercel.app"; // Replace with your actual domain

    // For this example, we'll add a few popular repositories.
    // In a real application, you could fetch this list from your database.
    const repositories = [
        { owner: "facebook", repo: "react" },
        { owner: "vercel", repo: "next.js" },
        { owner: "tensorflow", repo: "tensorflow" },
    ];

    const repositoryUrls = repositories.map(({ owner, repo }) => ({
        url: `${baseUrl}/${owner}/${repo}`,
        lastModified: new Date(),
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
        },
        ...repositoryUrls,
    ];
}