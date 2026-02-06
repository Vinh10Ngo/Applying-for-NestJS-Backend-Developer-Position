import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'super-secret-key-change-in-production',
    });
  }

  async validate(payload: { sub: string; email: string; role?: string }): Promise<CurrentUserPayload> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User không tồn tại hoặc token đã hết hạn. Vui lòng đăng nhập lại.');
    return { sub: payload.sub, email: payload.email, role: payload.role ?? user.role };
  }
}
