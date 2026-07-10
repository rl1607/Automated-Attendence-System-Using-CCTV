import mongoose, { Schema, Document } from 'mongoose';

export interface IFaceEmbedding extends Document {
  student: mongoose.Types.ObjectId;
  embedding: number[];
  modelUsed: string;
  version: string;
}

const FaceEmbeddingSchema: Schema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    embedding: { type: [Number], required: true },
    modelUsed: { type: String, required: true, default: 'Facenet' },
    version: { type: String, required: true, default: '1.0' }
  },
  { timestamps: true }
);

export default mongoose.model<IFaceEmbedding>('FaceEmbedding', FaceEmbeddingSchema);
