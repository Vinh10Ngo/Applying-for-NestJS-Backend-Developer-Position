import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";

export class UpdateUserRoleDto {
  @ApiProperty({ enum: ["admin", "user"], example: "admin" })
  @IsIn(["admin", "user"], { message: "Vai trò phải là admin hoặc user" })
  role: string;
}
