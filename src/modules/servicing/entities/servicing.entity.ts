import { Base } from "@/common/entities/base.entity";
import { Column, Entity } from "typeorm";

@Entity({
  name: "servicing",
})
export class Servicing extends Base {
  @Column({
    type: "varchar",
    length: 100,
  })
  name: string;

  @Column({
    type: "varchar",
    length: 100,
  })
  link: string;

  @Column({
    type: "text",
  })
  description: string;

  @Column({
    type: "varchar",
    length: 100,
  })
  key: string;
}
