import { Base } from "@/common/entities/base.entity";
import { User } from "@/modules/user/entities/user.entity";
import { Vehicle } from "@/modules/vehicle/entities/vehicle.entity";
import { Entity, ManyToOne, JoinColumn, Column } from "typeorm";

@Entity("user_vehicle")
export class UserVehicle extends Base {
  @ManyToOne(() => User, (user) => user.userVehicles, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "int", nullable: false })
  userId: number;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.userVehicles, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "vehicleId" })
  vehicle: Vehicle;

  @Column({ type: "int", nullable: false })
  vehicleId: number;
}
