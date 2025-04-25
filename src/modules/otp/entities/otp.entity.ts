import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Base } from "@/common/entities/base.entity";
import { User } from "@/modules/user/entities/user.entity";

@Entity({
  name: "otps",
})
export class OtpEntity extends Base {
  @Column({ type: "varchar", nullable: false })
  otp: string;

  @Column({ type: "varchar", nullable: false })
  type: string;

  @Column({ type: "bit", default: false, nullable: true })
  verified: boolean;

  @Column({ nullable: false })
  expireOn: Date;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "userId" })
  user?: User;

  @Column({ type: "int", nullable: true })
  userId?: number;

  @Column({ type: "varchar", nullable: true })
  phone: string;
}
