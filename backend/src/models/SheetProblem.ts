import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * SheetProblem — Mapping table: Sheet → Step → MasterProblem
 *
 * One row per (sheet, step, problem) triple.
 * Multiple sheets can point to the same masterProblemId.
 *
 * UserProgress tracks by masterProblemId — so solving "Two Sum"
 * in Blind 75 automatically marks it solved in NeetCode 150 too.
 */
export interface ISheetProblem extends Document {
  sheetId: Types.ObjectId;         // ref: DsaSheet
  stepId: Types.ObjectId;          // ref: DsaStep
  masterProblemId: number;         // ref: MasterProblem.problemId (numeric)
  orderInStep: number;             // Display order within the step (1-indexed)
  createdAt: Date;
  updatedAt: Date;
}

const SheetProblemSchema = new Schema<ISheetProblem>(
  {
    sheetId: { type: Schema.Types.ObjectId, ref: 'DsaSheet', required: true },
    stepId: { type: Schema.Types.ObjectId, ref: 'DsaStep', required: true },
    masterProblemId: { type: Number, required: true },
    orderInStep: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

// Unique: a problem can appear only once per (sheet, step) — reuse across steps within a sheet is allowed
SheetProblemSchema.index({ sheetId: 1, stepId: 1, masterProblemId: 1 }, { unique: true });

// Fast lookup: get all problems for a step
SheetProblemSchema.index({ stepId: 1, orderInStep: 1 });

// Fast lookup: get all sheets containing a problem (for cross-sheet progress display)
SheetProblemSchema.index({ masterProblemId: 1 });

export const SheetProblem = mongoose.model<ISheetProblem>('SheetProblem', SheetProblemSchema);
