import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("peak_plate_restriction")
export class PeakPlateRestriction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100, nullable: true })
  city: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  plate: string;

  @Column({ type: "int", nullable: true })
  year: number;

  @Column({ type: "int", nullable: true })
  month: number;

  @Column({ type: "simple-json", nullable: true })
  dailyRestrictions: any;

  @Column({ type: "varchar", length: 50, nullable: true })
  restrictionTime: string;
}
