import mongoose, { Schema } from "mongoose";

const RepoSchema = new Schema({
    owner: {
        type: String,
        // required: [true, "owner is required"],
        trim: true,
    },
    repo: {
        type: String,
        // required: [true, "repository is required"],
        trim: true,
    },
    lastModified: {
        type: Date,
        // required: [true, "last modified time is required"],
    },
    files: {
        type: Object,
        default: [],
    },
    structure: {
        type: String,
    },
});

export const RepoModel =
    mongoose.models.Repo || mongoose.model("Repo", RepoSchema);
