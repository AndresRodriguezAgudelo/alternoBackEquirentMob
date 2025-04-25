import { Base } from "@/common/entities/base.entity";
import { Category } from "@/modules/category/entities/category.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity({
  name: "guides",
})
export class Guides extends Base {
  @Column({ type: "varchar", length: 100 })
  name: string;

  @ManyToOne(() => Category, (category) => category.guides, { nullable: true })
  @JoinColumn({ name: "categoryId" })
  category?: Category;

  @Column({ type: "int", nullable: true })
  categoryId?: number;

  @Column({ type: "varchar", length: 100 })
  keyMain: string;

  @Column({ type: "varchar", length: 100 })
  keySecondary: string;

  @Column({ type: "varchar", length: 100 })
  keyTertiaryVideo: string;

  @Column({ type: "text" })
  description: string;
}
