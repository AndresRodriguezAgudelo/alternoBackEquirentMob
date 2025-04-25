import { Base } from "@/common/entities/base.entity";
import { Reminder } from "@/modules/reminder/entities/reminder.entity";
import { Vehicle } from "@/modules/vehicle/entities/vehicle.entity";
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "expiration" })
export class Expiration extends Base {
  @Column({ type: "varchar", length: 50, nullable: true })
  expirationType: string;

  @Column({ type: "date", nullable: true })
  expirationDate?: Date;

  @OneToMany(() => Reminder, (reminder) => reminder.expiration, {
    cascade: true,
    nullable: true,
  })
  reminders?: Reminder[];

  @Column({ type: "bit", default: false, nullable: true })
  isSpecial: boolean;

  @Column({ type: "bit", default: false, nullable: true })
  hasBanner: boolean;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.expirations, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "vehicleId" })
  vehicle?: Vehicle;

  @Column({ type: "int" })
  vehicleId: number;

  @Column({ type: "nvarchar", length: "max", nullable: true })
  description: string;

  @Column({ type: "simple-json", nullable: true })
  extraData: Record<string, any>;

  @UpdateDateColumn()
  lastUpdate?: Date;
}
