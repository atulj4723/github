import fs from "fs";
export async function GET() {
    let data = fs.readFileSync("tree.json", "utf-8");
    data = JSON.parse(data);
    return Response.json({ success: true, data: data.files }, { status: 200 });
}
