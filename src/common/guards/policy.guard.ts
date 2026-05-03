import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PolicyEngineService } from "src/policy/policy-engine.service";

// policy.guard.ts
@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private policyEngine: PolicyEngineService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const role = req.user.role; // get current user role from AuthGuard

    const resource = this.reflector.get<string>('resource', context.getHandler()); //
    const action = this.reflector.get<string>('action', context.getHandler());

    const allowed = await this.policyEngine.evaluate({ //returns to policy engine for evaluation if the user with his role can access the resource or not
      role,
      resource,
      action,
      context: {
        ip: req.context?.ip || null,
      },
    }); //returns true if access is allowed, false otherwise from policy engine service
    console.log(req.context?.ip, resource, action, allowed, role);
    if (!allowed) {
      throw new ForbiddenException('Access Denied by Policy');
    }

    return true;
  }
}