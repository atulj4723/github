import mongoose, { Schema } from "mongoose";

const RepoSchema = new Schema({
    owner: {
        type: String,
        trim: true,
    },
    repo: {
        type: String,
        trim: true,
    },
    lastModified: {
        type: Date,
    },
    files: {
        type: Object,
        default: {},
    },
    systemPrompt: {
        type: String,
    },
});

export const RepoModel =
    mongoose.models.Repo || mongoose.model("Repo", RepoSchema);
