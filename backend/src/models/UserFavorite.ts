import mongoose, { Schema, Document } from 'mongoose';

export interface IUserFavorite extends Document {
  userId: string;
  problemId: number;
  sourceSlug: string;
  createdAt: Date;
}

const UserFavoriteSchema = new Schema<IUserFavorite>(
  {
    userId: { type: String, required: true },
    problemId: { type: Number, required: true },
    sourceSlug: { type: String, required: true },
  },
  { timestamps: true }
);

UserFavoriteSchema.index({ userId: 1, problemId: 1, sourceSlug: 1 }, { unique: true });
UserFavoriteSchema.index({ userId: 1 });

export const UserFavorite = mongoose.model<IUserFavorite>('UserFavorite', UserFavoriteSchema);
