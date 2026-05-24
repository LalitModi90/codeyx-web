import mongoose from 'mongoose';

export interface IReminder extends mongoose.Document {
    userId: string;
    contestId: mongoose.Types.ObjectId;
    reminderBefore: number; // in minutes (e.g. 10, 30, 60, 1440)
    notified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const reminderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
    reminderBefore: { type: Number, required: true }, // 10, 30, 60, 1440 mins
    notified: { type: Boolean, default: false }
}, { timestamps: true });

// Avoid duplicate reminders for same user, contest, and interval
reminderSchema.index({ userId: 1, contestId: 1, reminderBefore: 1 }, { unique: true });

export const Reminder = mongoose.model<IReminder>('Reminder', reminderSchema);
