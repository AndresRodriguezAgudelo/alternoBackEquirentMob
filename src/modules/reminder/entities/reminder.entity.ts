import { Base } from "@/common/entities/base.entity";
import { Expiration } from "@/modules/expiration/entities/expiration.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity({
  name: "reminders",
})
export class Reminder extends Base {
  @Column({ type: "int" })
  days: number;

  @ManyToOne(() => Expiration, (expiration) => expiration.reminders, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "expirationId" })
  expiration: Expiration;

  @Column({ type: "int", nullable: true })
  expirationId: number;
}
