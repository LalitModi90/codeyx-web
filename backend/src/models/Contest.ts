import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    site: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: String },
    url: { type: String, required: true },
    status: { type: String, required: true },
}, { timestamps: true });

export const Contest = mongoose.models.Contest || mongoose.model('Contest', contestSchema);
