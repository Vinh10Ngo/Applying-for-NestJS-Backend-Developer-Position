import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ArticleDocument = Article & Document;

@Schema({ timestamps: true })
export class Article {
  @Prop({ required: true })
  title: string;

  @Prop()
  content: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  authorId: Types.ObjectId;

  @Prop({ default: true })
  published: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

ArticleSchema.index({ authorId: 1, createdAt: -1 });
ArticleSchema.index({ title: "text", content: "text" });
