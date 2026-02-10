import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: "User", default: null })
  userId: Types.ObjectId | null;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  resource: string;

  @Prop()
  resourceId: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop()
  ip: string;

  @Prop()
  userAgent: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
