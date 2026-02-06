import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private mongoose: Connection) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Kiểm tra API và kết nối MongoDB' })
  check() {
    const mongodb = this.mongoose.readyState === 1 ? 'connected' : 'disconnected';
    return {
      status: mongodb === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      mongodb,
    };
  }
}
