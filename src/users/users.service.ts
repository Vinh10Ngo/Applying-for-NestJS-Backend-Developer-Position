import {
  Injectable,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import { User, UserDocument } from "./schemas/user.schema";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userModel
      .findOne({ email: createUserDto.email })
      .exec();
    if (existing) {
      throw new ConflictException("Email đã được sử dụng");
    }
    const hashed = await bcrypt.hash(createUserDto.password, 10);
    const user = new this.userModel({
      ...createUserDto,
      password: hashed,
    });
    return user.save();
  }

  async findByEmail(
    email: string,
    withPassword = false,
  ): Promise<UserDocument | null> {
    const q = this.userModel.findOne({ email });
    if (withPassword) q.select("+password");
    return q.exec();
  }

  async findById(
    id: string,
    withPassword = false,
  ): Promise<UserDocument | null> {
    const q = this.userModel.findById(id);
    if (withPassword) q.select("+password");
    return q.exec();
  }

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userModel
      .findById(userId)
      .select("+password")
      .exec();
    if (!user) throw new BadRequestException("User không tồn tại");
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new BadRequestException("Mật khẩu hiện tại không đúng");
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select("-password").exec();
  }

  async updateRole(userId: string, role: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new BadRequestException("User không tồn tại");
    if (role !== "admin" && role !== "user") {
      throw new BadRequestException("Vai trò phải là admin hoặc user");
    }
    user.role = role;
    return user.save();
  }

  async validatePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
