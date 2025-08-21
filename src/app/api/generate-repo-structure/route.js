import dbConnect from "@/lib/dbConnet";
import { RepoModel } from "@/models/Repo";

export async function POST(request) {
    const { owner, repo } = await request.json();

    try {
        await dbConnect();
        const data = await RepoModel.findOne({ owner, repo });
        let tree = "";

        const generate = (files, prefix) => {
            for (let i = 0; i < files?.length; i++) {
                const item = files[i];
                const isLast = i === files.length - 1;
                const connector = isLast ? "└── " : "├── ";
                tree += prefix + connector + item.name + "\n";
                if (item.type === "dir") {
                    const newPrefix = prefix + (isLast ? "    " : "│   ");
                    generate(item.files, newPrefix);
                }
            }
            return tree;
        };
        const res = generate(data.files.files, "");
        return Response.json({ success: true, message: res }, { status: 200 });
    } catch (e) {
        console.log(e);
        return Response.json(
            { success: false, message: e.message },
            { status: 400 }
        );
    }
}
