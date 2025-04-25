import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "@/modules/user/entities/user.entity";
import { Base } from "@/common/entities/base.entity";

@Entity("device_registrations")
export class DeviceRegistration extends Base {
  @Column()
  deviceToken: string;

  @Column({ nullable: true })
  registrationId?: string;

  @Column()
  platform: string;

  @Column("simple-array", { nullable: true })
  tags?: string[];

  @CreateDateColumn()
  registeredAt: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  userId: number;
}
