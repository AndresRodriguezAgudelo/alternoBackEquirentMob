import { Base } from "@/common/entities/base.entity";
import { Entity, Column } from "typeorm";
@Entity("document_type")
export class DocumentType extends Base {
  @Column({ type: "varchar", length: 100, nullable: false })
  typeName: string;
}
