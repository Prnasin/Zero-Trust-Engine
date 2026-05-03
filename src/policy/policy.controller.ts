import { Controller, Get, Post, Body, Patch, Request, Delete, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

// policy.controller.ts

@Controller('policies')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class PolicyController {
  constructor(private policyService: PolicyService) {}

  @Post()
  create(@Body() dto: any, @Request() req: any) {
    return this.policyService.create(dto, req.user.role);
  }

  @Get()
  findAll() {
    return this.policyService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
    return this.policyService.update(id, dto, req.user.role);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.policyService.delete(id, req.user.role);
  }
}
