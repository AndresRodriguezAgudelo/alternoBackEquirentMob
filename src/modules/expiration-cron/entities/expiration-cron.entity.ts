import { Base } from "@/common/entities/base.entity";
import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { Expiration } from "@/modules/expiration/entities/expiration.entity";

@Entity({ name: "expiration_cron" })
export class ExpirationCron extends Base {
  @Column({ type: "varchar", length: 255 })
  message: string;

  @Column({ type: "int", nullable: true })
  reminderDays: number;

  @ManyToOne(() => Expiration, { onDelete: "CASCADE" })
  @JoinColumn({ name: "expirationId" })
  expiration: Expiration;

  @Column({ type: "int" })
  expirationId: number;

  @Column({ type: "datetime" })
  notifiedAt: Date;

  @Column({ type: "varchar", nullable: true })
  type: string;
}
