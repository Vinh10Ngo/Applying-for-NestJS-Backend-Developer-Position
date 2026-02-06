import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    validatePassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => (key === 'JWT_EXPIRES' ? '7d' : '7d')),
    getOrThrow: jest.fn((key: string) => (key === 'JWT_REFRESH_SECRET' ? 'refresh-secret' : 'secret')),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access_token and user when credentials are valid', async () => {
      const user = {
        _id: { toString: () => 'user-id' },
        email: 'test@example.com',
        password: 'hashed',
        role: 'user',
      } as any;
      mockUsersService.findByEmail.mockResolvedValue(user);
      mockUsersService.validatePassword.mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: '123456',
      });

      expect(result).toHaveProperty('access_token', 'mock-token');
      expect(result).toHaveProperty('refresh_token', 'mock-token');
      expect(result.user).toEqual({ id: 'user-id', email: 'test@example.com', role: 'user' });
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com', true);
      expect(usersService.validatePassword).toHaveBeenCalledWith('123456', 'hashed');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'none@example.com', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(usersService.validatePassword).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      const user = { _id: { toString: () => 'id' }, email: 't@t.com', password: 'hash', role: 'user' } as any;
      mockUsersService.findByEmail.mockResolvedValue(user);
      mockUsersService.validatePassword.mockResolvedValue(false);

      await expect(
        service.login({ email: 't@t.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create user and return tokens', async () => {
      const createdUser = {
        _id: { toString: () => 'new-id' },
        email: 'new@example.com',
        role: 'user',
      } as any;
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await service.register({
        email: 'new@example.com',
        password: '123456',
        fullName: 'Test User',
      });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@example.com', password: '123456', fullName: 'Test User' }),
      );
      expect(result.access_token).toBe('mock-token');
      expect(result.user.email).toBe('new@example.com');
    });
  });
});
