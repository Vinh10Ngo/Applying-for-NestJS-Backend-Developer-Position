import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Chỉ user có ít nhất một role trong danh sách mới được truy cập.
 * Ví dụ: @Roles('admin') hoặc @Roles('admin', 'moderator')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
