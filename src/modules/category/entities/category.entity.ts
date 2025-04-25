import { Base } from "@/common/entities/base.entity";
import { Guides } from "@/modules/guides/entities/guides.entity";
import { Entity, Column, OneToMany } from "typeorm";
@Entity({
  name: "categories",
})
export class Category extends Base {
  @Column({ type: "varchar", length: 100, nullable: false })
  categoryName: string;

  @OneToMany(() => Guides, (guides) => guides.category)
  guides: Guides[];
}
