import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Policy } from "./schemas/policy.schema";
import { Model } from "mongoose";

// policy.service.ts
@Injectable()
export class PolicyService {
  constructor(
    @InjectModel(Policy.name) private policyModel: Model<Policy>
  ) {}

  create(dto: any, role: string) {
    if(dto.role==='SUPERADMIN' && role==='ADMIN') {
      throw new ForbiddenException('ADMIN cannot create SUPERADMIN policy!!');
    }
    return this.policyModel.create(dto);
  }

  findAll() {
    return this.policyModel.find();
  }

  update(id: string, dto: any, role: string) {
    if(dto.role==='SUPERADMIN' && role==='ADMIN') {
      throw new ForbiddenException('Only SUPERADMIN can update SUPERADMIN policy!!');
    }
    return this.policyModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async delete(id: string, role: string) {
    const policy = await this.policyModel.findById(id);
    if(policy?.role==='SUPERADMIN' && role==='ADMIN') {
      throw new ForbiddenException('Only SUPERADMIN can delete SUPERADMIN policy!!');
    }
    return this.policyModel.findByIdAndDelete(id);
  }
}
