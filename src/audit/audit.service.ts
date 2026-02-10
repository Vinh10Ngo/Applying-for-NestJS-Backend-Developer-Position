import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuditLog, AuditLogDocument } from "./schemas/audit-log.schema";

export interface AuditContext {
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private auditModel: Model<AuditLogDocument>,
  ) {}

  async log(
    action: string,
    resource: string,
    options: {
      userId?: string | null;
      resourceId?: string;
      metadata?: Record<string, unknown>;
      ip?: string;
      userAgent?: string;
    } = {},
  ): Promise<AuditLogDocument> {
    const doc = new this.auditModel({
      action,
      resource,
      resourceId: options.resourceId,
      userId: options.userId ? new Types.ObjectId(options.userId) : null,
      metadata: options.metadata ?? {},
      ip: options.ip,
      userAgent: options.userAgent,
    });
    return doc.save();
  }

  async findRecent(
    page = 1,
    limit = 20,
    filters?: { userId?: string; resource?: string; action?: string },
  ) {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};
    if (filters?.userId) filter.userId = new Types.ObjectId(filters.userId);
    if (filters?.resource) filter.resource = filters.resource;
    if (filters?.action) filter.action = filters.action;

    const [items, total] = await Promise.all([
      this.auditModel
        .find(filter)
        .populate("userId", "email fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.auditModel.countDocuments(filter).exec(),
    ]);
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
