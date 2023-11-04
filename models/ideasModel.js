import mongoose from "mongoose";

const ideaSchema = new mongoose.Schema(
    {
        idea: {
            type: String,
            required: true,
            trim: true,
        },
        implementation: {
            type: String,
            required: true,
        },
        resources: {
            type: String,
            required: true,
        },
        user: {
            type: mongoose.ObjectId,
            ref: "users",
            required: true,
        },
        cost: {
            type: String,
            required: true,
        },
        planTime: {
            type: String,
            enum: ["One Time", "Recurring"],
            required: true,
        },
        department: {
            type: String,
            required: false,
        },
        location: {
            type: String,
            required: false,
        },
        ideaStatus: {
            type: String,
            enum: ["Published", "Draft"],
            default: "Published",
            required: false,
        },
        reason: {
            type: String,
            required: false,
        },
        rejectedBy: {
            type: String,
            required: false,
        },
        summary: {
            type: String,
            required: false,
        },
        status: {
            type: String,
            enum: ["Approved", "Work in progress", "Rejected", "Implemented"],
            default: "Work in progress",
            required: false,
        },
        file: {
            data: Buffer,
            contentType: String,
            filename:String,
        }
    },
    { timestamps: true }
);

export default mongoose.model("Ideas", ideaSchema);