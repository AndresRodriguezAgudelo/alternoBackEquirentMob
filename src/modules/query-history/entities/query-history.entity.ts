import { Base } from "@/common/entities/base.entity";
import { User } from "@/modules/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity({
  name: "query_history",
})
export class QueryHistory extends Base {
  @ManyToOne(() => User, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user?: User;

  @Column({ type: "int", nullable: true })
  userId?: number;

  @Column({ nullable: true })
  module?: string;

  @Column({ nullable: true })
  expirationId?: number;
}
