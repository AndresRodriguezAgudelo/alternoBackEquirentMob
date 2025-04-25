import { Base } from "@/common/entities/base.entity";
import { Column, Entity } from "typeorm";

@Entity({
  name: "insurers",
})
export class Insurer extends Base {
  @Column({
    type: "varchar",
    length: 255,
    nullable: false,
  })
  nameInsurer: string;
}
