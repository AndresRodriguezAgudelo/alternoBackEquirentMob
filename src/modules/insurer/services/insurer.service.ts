import { HttpException, HttpStatus, Injectable, Query } from "@nestjs/common";
import { InsurerRepository } from "../repositories/insurer.repository";
import { CreateInsurerDto, UpdateInsurerDto } from "../schemas/insurer.schema";
import { Insurer } from "../entities/insurer.entity";
import to from "await-to-js";
import { PageDto, PageOptionsDto } from "@/common";

@Injectable()
export class InsurerService {
  constructor(private readonly insurerRepository: InsurerRepository) {}

  async create(body: CreateInsurerDto): Promise<Insurer> {
    try {
      const existingInsurer = await this.insurerRepository.findOne({
        nameInsurer: body.nameInsurer,
      });
      if (existingInsurer) {
        throw new HttpException(
          "La aseguradora ya existe",
          HttpStatus.BAD_REQUEST,
        );
      }
      const insurer = new Insurer();
      insurer.nameInsurer = body.nameInsurer;

      const [error, newDocument] = await to(
        this.insurerRepository.save(insurer),
      );
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return newDocument;
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Insurer>> {
    try {
      const [error, data] = await to(
        this.insurerRepository.findAll(pageOptionsDto),
      );
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {
    try {
      const Document = await this.insurerRepository.findOne({ id });
      if (!Document) {
        throw new HttpException(
          "Aseguradora no encontrada",
          HttpStatus.NOT_FOUND,
        );
      }
      return Document;
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateInsurerDto): Promise<string> {
    try {
      const [error, data] = await to(this.insurerRepository.update(id, dto));
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number) {
    try {
      const [error, data] = await to(this.insurerRepository.remove(id));
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
