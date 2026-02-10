import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: "user" })
  role: string;

  @Prop()
  fullName?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
// Không thêm UserSchema.index({ email: 1 }) vì unique: true ở email đã tạo index
