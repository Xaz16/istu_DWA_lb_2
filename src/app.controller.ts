import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root() {
    return {
      name: 'istu_dwa_lb_2',
      api: '/api',
      health: '/health',
      adminLogin: '/login',
      adminPanel: '/admin',
      apiDocs: '/api-docs',
    };
  }

  @Get('health')
  health() {
    return { ok: true };
  }
}
