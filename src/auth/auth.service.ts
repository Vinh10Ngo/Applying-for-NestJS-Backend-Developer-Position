import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

interface StoredRefreshToken {
  userId: string;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  private refreshTokenStore = new Map<string, StoredRefreshToken>();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return this.loginResponse(user.email, user._id.toString(), user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email, true);
    if (!user || !(await this.usersService.validatePassword(dto.password, user.password))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    return this.loginResponse(user.email, user._id.toString(), user.role);
  }

  async refresh(refreshToken: string) {
    const secret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    let payload: { sub: string; email: string; role: string };
    try {
      payload = this.jwtService.verify(refreshToken, { secret });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
    const stored = this.refreshTokenStore.get(refreshToken);
    if (!stored || stored.userId !== payload.sub) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
    this.refreshTokenStore.delete(refreshToken);
    return this.loginResponse(payload.email, payload.sub, payload.role);
  }

  async logout(refreshToken: string) {
    this.refreshTokenStore.delete(refreshToken);
    return { message: 'Đã đăng xuất' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    await this.usersService.updatePassword(userId, currentPassword, newPassword);
    return { message: 'Đổi mật khẩu thành công' };
  }

  private loginResponse(email: string, userId: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_EXPIRES') ?? '15m',
    });
    const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    const refreshExpires = this.config.get('JWT_REFRESH_EXPIRES') ?? '7d';
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpires,
    });
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    this.refreshTokenStore.set(refreshToken, { userId, expiresAt });
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: { id: userId, email, role },
    };
  }
}
