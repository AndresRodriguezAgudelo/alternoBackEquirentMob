import { Base } from "@/common/entities/base.entity";
import { City } from "@/modules/city/entities/city.entity";
import { DocumentType } from "@/modules/document-type/entities/document-type.entity";
import { Expiration } from "@/modules/expiration/entities/expiration.entity";
import { UserVehicle } from "@/modules/user-vehicle/entities/userVehicle.entity";
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";

@Entity("vehicle")
export class Vehicle extends Base {
  @Column({ type: "varchar", length: 20, unique: true, nullable: false })
  licensePlate: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  numberDocument: string;

  @ManyToOne(() => DocumentType, { nullable: false })
  @JoinColumn({ name: "typeDocumentId" })
  typeDocument: DocumentType;

  @Column({ type: "int", nullable: true })
  typeDocumentId: number;

  @Column({ type: "varchar", length: 50, nullable: true })
  model: string;

  @Column({ type: "int", nullable: true })
  age: number;

  @Column({ type: "varchar", nullable: true })
  brand: string;

  @Column({ type: "varchar", nullable: true })
  line: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  class: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  service: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  fuel: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  color: string;

  @Column({ type: "int", nullable: true })
  passagers: number;

  @Column({ type: "varchar", length: 50, nullable: true })
  vin: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  serial: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  numberEngine: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  capacityEngine: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  numberRegister: string;

  @Column({ type: "date", nullable: true })
  dateRegister: Date;

  @ManyToOne(() => City, (city) => city.vehicles, { nullable: true })
  @JoinColumn({ name: "cityRegisterId" })
  cityRegister: City;

  @Column({ type: "int", nullable: true })
  cityRegisterId: number;

  @Column({ type: "varchar", length: 50, nullable: true })
  cityRegisterName: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  organismTransit: string;

  @OneToMany(() => UserVehicle, (userVehicle) => userVehicle.vehicle)
  userVehicles: UserVehicle[];

  @OneToMany(() => Expiration, (expiration) => expiration.vehicle, {
    cascade: true,
    nullable: true,
  })
  expirations: Expiration[];

  @Column({ type: "bit", default: false, nullable: true })
  runtConsulted: boolean;
}
