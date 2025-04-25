import { Base } from "@/common/entities/base.entity";
import { User } from "@/modules/user/entities/user.entity";
import { Vehicle } from "@/modules/vehicle/entities/vehicle.entity";
import { Entity, Column, OneToMany } from "typeorm";

@Entity({ name: "cities" })
export class City extends Base {
  @Column({ type: "varchar", length: 100, nullable: false })
  cityName: string;

  @OneToMany(() => User, (user) => user.city)
  users: User[];

  @OneToMany(() => Vehicle, (vehicle) => vehicle.cityRegister)
  vehicles: Vehicle[];
}
