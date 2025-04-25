import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Base } from "@/common/entities/base.entity";
import { City } from "@/modules/city/entities/city.entity";
import { UserVehicle } from "@/modules/user-vehicle/entities/userVehicle.entity";

@Entity({ name: "users" })
export class User extends Base {
  @Column({ type: "varchar", length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ type: "bit", default: false, nullable: false })
  accepted: boolean;

  @ManyToOne(() => City, (city) => city.users, { nullable: false })
  @JoinColumn({ name: "cityId" })
  city: City;

  @Column({ type: "int", nullable: false })
  cityId: number;

  @OneToMany(() => UserVehicle, (userVehicle) => userVehicle.user)
  userVehicles: UserVehicle[];

  @Column({ type: "varchar", length: 255, nullable: true })
  photo: string;

  @Column({ type: "varchar", length: 255, nullable: true, unique: true })
  phone: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  password: string;

  @Column({ type: "bit", default: false, nullable: false })
  verify: boolean;

  @Column({ type: "bit", default: false, nullable: true })
  status: boolean;
}
