import mongoose, { Schema, Document } from 'mongoose';

export interface IFriend extends Document {
  user1Id: string;
  user2Id: string;
}

const friendSchema = new Schema<IFriend>(
  {
    user1Id: { type: String, required: true, index: true },
    user2Id: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

// Ensure user1Id is always lexicographically smaller than user2Id to prevent duplicates
friendSchema.pre('save', function () {
  if (this.user1Id > this.user2Id) {
    const temp = this.user1Id;
    this.user1Id = this.user2Id;
    this.user2Id = temp;
  }
});

friendSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });

export const Friend = mongoose.model<IFriend>('Friend', friendSchema);
