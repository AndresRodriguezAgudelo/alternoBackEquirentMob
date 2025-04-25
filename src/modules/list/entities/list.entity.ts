import { Base } from "@/common/entities/base.entity";
import { Entity, Column } from "typeorm";

@Entity({ name: "list_order" })
export class ListOrder extends Base {
  @Column("simple-json", { nullable: false })
  orderIds: number[];
}
