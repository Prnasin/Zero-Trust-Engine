import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Policy } from "./schemas/policy.schema";
import { Model } from "mongoose";

//returns true if access is allowed, false otherwise

@Injectable()
export class PolicyEngineService {
  constructor(
    @InjectModel(Policy.name) private policyModel: Model<Policy>
  ) {}

  async evaluate(input: { // input for policy evaluation
    role: string;
    resource: string;
    action: string;
    context: any;
  }): Promise<boolean> {

    const policies = await this.policyModel.find({ //if exist in db same data
      role: input.role,
      resource: input.resource,
      action: input.action,
    });

    for (const policy of policies) {
      const conditionPass = this.evaluateCondition( // evaluate any conditions
        policy.condition, // JSON string with conditions like IP, time, etc.
        input.context // context from request, e.g. IP, time, etc.
      );

      if (conditionPass) {
        return policy.allow;
      }
    }

    return false; // default deny
  }

    evaluateCondition(condition: string | undefined, context: any): boolean {
    if (!condition) return true;

    const parsed = JSON.parse(condition);

    // IP check
    if (parsed.ip && parsed.ip !== context.ip) {
      return false;
    }

    // Time check
    if (parsed.time) {
      const now = new Date();
      const currentHour = now.getHours();

      const start = parseInt(parsed.time.start.split(':')[0]);
      const end = parseInt(parsed.time.end.split(':')[0]);

      if (currentHour < start || currentHour > end) {
        return false;
      }
    }

    return true;
  }
}
