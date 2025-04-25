import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { PageDto, PageMetaDto } from "@/common";
import { User } from "../entities/user.entity";
import { IUser } from "@/interfaces/user.interface";
import { FiltersDto, UpdateUserDto } from "../schemas/user.schema";
import { throwCustomError } from "@/common/utils/Error";
import { TemplatesService } from "@/modules/templates/templates.service";
import { MailService } from "@/config/mail/mail.service";
import to from "await-to-js";
import { UserVehicle } from "@/modules/user-vehicle/entities/userVehicle.entity";
import { QueryHistory } from "@/modules/query-history/entities/query-history.entity";
import { Vehicle } from "@/modules/vehicle/entities/vehicle.entity";

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly dataSource: DataSource,
    private templatesService: TemplatesService,
    private mailService: MailService,
  ) {}


  public async save(User: User): Promise<User> {
    return await this.repository.save(User);
  }

  public async findOne(data: IUser): Promise<User> {
    const User = await this.repository.findOne({
      where: { ...data },
    });
    return User;
  }

  public async findOneRelations(data: IUser): Promise<User> {
    const User = await this.repository.findOne({
      where: { ...data },
      relations: ["userVehicles", "city"],
    });
    return User;
  }

  public async findAll(pageOptionsDto: FiltersDto): Promise<PageDto<User>> {
    const queryBuilder = this.repository.createQueryBuilder("user");

    queryBuilder
      .select([
        "user.id",
        "user.email",
        "user.name",
        "user.accepted",
        "user.verify",
        "user.phone",
        "user.createdAt",
        "userVehicles.id",
        "vehicles.licensePlate",
        "vehicles.dateRegister",
        "vehicles.numberDocument",
        "typeDocuments.typeName",
        "user.status",
      ])
      .leftJoin("user.userVehicles", "userVehicles")
      .leftJoin("userVehicles.vehicle", "vehicles")
      .leftJoin("vehicles.typeDocument", "typeDocuments")
      .orderBy("user.name", pageOptionsDto.order)
      .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
      .take(pageOptionsDto.take);

    if (pageOptionsDto.search) {
      queryBuilder.andWhere(
        "(LOWER(user.name) LIKE LOWER(:search) OR LOWER(user.phone) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))",
        { search: `%${pageOptionsDto.search}%` },
      );
    }

    if (pageOptionsDto.startDate && pageOptionsDto.endDate) {
      queryBuilder.andWhere("user.createdAt BETWEEN :startDate AND :endDate", {
        startDate: pageOptionsDto.startDate,
        endDate: pageOptionsDto.endDate,
      });
    }

    if (typeof pageOptionsDto.status === "string") {
      pageOptionsDto.status = pageOptionsDto.status === "true" ? 1 : 0;
    } else if (typeof pageOptionsDto.status === "boolean") {
      pageOptionsDto.status = pageOptionsDto.status ? 1 : 0;
    }

    if (pageOptionsDto.status === 0 || pageOptionsDto.status === 1) {
      queryBuilder.andWhere("user.status = :status", {
        status: pageOptionsDto.status,
      });
    }

    if (
      pageOptionsDto.totalVehicles == 1 ||
      pageOptionsDto.totalVehicles == 2
    ) {
      console.log("TOTAL VEHÍCULOS:", pageOptionsDto.totalVehicles);
      queryBuilder.andWhere(
        `(SELECT COUNT(uv.vehicleId) FROM user_vehicle uv WHERE uv.userId = user.id) = :totalVehicles`,
        { totalVehicles: pageOptionsDto.totalVehicles },
      );
    }

    let total = await queryBuilder.getCount();
    const users = await queryBuilder.getMany();

    //remove user email = admin@admin.com
    users.forEach((user) => {
      if (user.email === "admin@admin.com") {
        users.splice(users.indexOf(user), 1);
        total--;
      }
    });

    const pageMetaDto = new PageMetaDto({ total, pageOptionsDto });

    return new PageDto(users, pageMetaDto);
  }

  async update(id: number, updateBranch: UpdateUserDto): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    let transactionStarted = false;

    try {
      await queryRunner.startTransaction();
      transactionStarted = true;

      const user = await queryRunner.manager.findOne(User, { where: { id } });

      if (!user) {
        throw throwCustomError("not_found_user");
      }

      if (updateBranch.email) {
        const existingUser = await queryRunner.manager.findOne(User, {
          where: { email: updateBranch.email },
        });

        if (existingUser && existingUser.id !== id) {
          throw throwCustomError("user_exists");
        }

        updateBranch.verify = false;        

      }

      if (updateBranch.phone) {
        const existingUser = await queryRunner.manager.findOne(User, {
          where: { phone: updateBranch.phone },
        });

        if (existingUser && existingUser.id !== id) {
          throw throwCustomError("phone_exists");
        }
      }

      await queryRunner.manager.update(User, id, updateBranch);

      if (updateBranch.email) {
        user.email = updateBranch.email;
        //send email verification
        await this.sendMailRegister(user);
      }

      await queryRunner.commitTransaction();
      return "Usuario actualizado correctamente";
    } catch (error) {
      if (transactionStarted) {
        await queryRunner.rollbackTransaction();
      }
      throw throwCustomError(error.response.errorType);
    } finally {
      if (transactionStarted) {
        await queryRunner.release();
      }
    }
  }

  public async remove(id: number): Promise<void> {
    const user = await this.findOneRelations({ id });
    if (!user) {
      throwCustomError("not_found_user");
    }

    const userVehicleRepo = this.repository.manager.getRepository(UserVehicle);
    const vehicleRepo = this.repository.manager.getRepository(Vehicle);

    const userVehicles = await userVehicleRepo.find({ where: { userId: id } });

    for (const uv of userVehicles) {
      const associations = await userVehicleRepo.count({
        where: { vehicleId: uv.vehicleId },
      });
      if (associations === 1) {
        await vehicleRepo.delete({ id: uv.vehicleId });
      }
    }

    const queryHistoryRepo =
      this.repository.manager.getRepository(QueryHistory);
    await queryHistoryRepo.delete({ userId: id });

    await userVehicleRepo.delete({ userId: id });

    await this.repository.delete(id);
  }



  

  public async resetPassword(data: IUser, token: string): Promise<string> {
    const template = this.templatesService.update({
      title: "Restablecer contraseña",
      welcome: `Hola ${data.email}`,
      text_1: `Hemos recibido una solicitud para restablecer tu contraseña.`,
      label: "Para restablecer tu contraseña, haz clic en el siguiente botón:",
      text_2:
        "Si no solicitaste restablecer tu contraseña, ignora este mensaje.",
      title_help: "¿Necesitas ayuda?",
      text_help: "Por favor, escríbenos a:",
      email_help: "fleet@equisoft.app",
      template: "updatePassword",
      url: `https://back-app-equisoft-production.up.railway.app/api/sign/v1/auth/reset-password?token=${token}`,
      tokens: token,
    });

    const [error, responseMail] = await to(
      this.mailService.sendEmail(
        [data.email],
        `Restablecer contraseña`,
        "",
        template,
      ),
    );

    console.log({ responseMail, error });

    if (error) {
      console.log({ body: error["response"].body.errors });
      throwCustomError("send_mail_error");
    }

    return "Correo de restablecer contraseña enviado correctamente";
  }

  async findByPhone(phone: string): Promise<User> {
    return this.repository.findOne({ where: { phone } });
  }

  async updatePassword(userId: number, password) {
    return await this.repository.update(userId, { password });
  }


  public async sendMailRegister(user: User): Promise<void> {
    const template = this.templatesService.update({
      title: "Registro",
      welcome: `Bienvenido a Equirent Mobility`,
      text_1: `¡Hola! `,
      label: "¡Gracias por registrarte!",
      text_2:
        " Te damos la bienvenida a nuestra plataforma, esperamos que disfrutes de nuestros servicios.",
      title_help: "¿Necesitas ayuda?",
      text_help: "Por favor, escríbenos a:",
      email_help: "fleet@equisoft.app",
      template: "register",
      url: `https://back-app-equisoft-production.up.railway.app/api/sign/v1/user/verify/email?userId=${user.id}`,
    });
    const [error, responseMail] = await to(
      this.mailService.sendEmail(
        [user.email],
        `Bienvenido a Equirent Mobility`,
        "",
        template,
      ),
    );

    console.log({ responseMail, error });

    if (error !== null) {
      throwCustomError("send_mail_error");
    }
  }

  public async updateEmailStatus(id: number, verify: boolean): Promise<void> {
    await this.repository.update(id, { verify });
  }

  public async sendMailCode(data: User, code: string) {
    const template = this.templatesService.update({
      title: "Restablecer contraseña",
      welcome: `Hola ${data.name}`,
      text_1: `Hemos recibido una solicitud para recuperar tu cuenta.`,
      label: "Para restablecer tu contraseña, haz clic en el siguiente botón:",
      text_2:
        "Si no solicitaste restablecer tu contraseña, ignora este mensaje.",
      title_help: "¿Necesitas ayuda?",
      text_help: "Por favor, escríbenos a:",
      email_help: "fleet@equisoft.app",
      template: "recoveryOtp",
      tokens: code,
    });
    const [error, responseMail] = await to(
      this.mailService.sendEmail(
        [data.email],
        `Recuperar cuenta`,
        "",
        template,
      ),
    );

    console.log({ responseMail, error });

    if (error) {
      console.log({ body: error["response"].body.errors });
      throwCustomError("send_mail_error");
    }

    return "Correo de recuperar cuenta enviado correctamente";
  }
}
