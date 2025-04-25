import { HttpException, HttpStatus, Injectable, Query } from "@nestjs/common";
import { Servicing } from "../entities/servicing.entity";
import {
  CreateServicingDto,
  UpdateServicingDto,
} from "../schemas/servicing.schema";
import to from "await-to-js";
import { PageDto, PageOptionsDto } from "@/common";
import { ServicingRepository } from "../repositories/servicing.repository";
import { FilesService } from "@/modules/files/services/files.service";

@Injectable()
export class ServicingService {
  constructor(
    private readonly servicingRepository: ServicingRepository,
    private readonly filesService: FilesService,
  ) {}

  async create(body: CreateServicingDto, file: any): Promise<Servicing> {
    if (!file) {
      throw new HttpException("Imagen requerida", HttpStatus.BAD_REQUEST);
    }

    const dataFileSaved = {
      file,
      name: body.name,
      category: "servicing",
    };

    const [uploadError, imageUrl] = await to(
      this.filesService.uploadFile(dataFileSaved),
    );
    if (uploadError || !imageUrl) {
      throw new HttpException(
        uploadError || "Error al subir la imagen",
        HttpStatus.BAD_REQUEST,
      );
    }

    const service = new Servicing();
    service.name = body.name;
    service.link = body.link;
    service.description = body.description;
    service.key = imageUrl;

    const [saveError, newService] = await to(
      this.servicingRepository.save(service),
    );
    if (saveError) {
      throw new HttpException(saveError, HttpStatus.BAD_REQUEST);
    }

    return newService;
  }

  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Servicing>> {
    try {
      const [error, data] = await to(
        this.servicingRepository.findAll(pageOptionsDto),
      );
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number): Promise<Servicing> {
    try {
      const servicing = await this.servicingRepository.findOne({ id });
      if (!servicing) {
        throw new HttpException("Servicio no encontrado", HttpStatus.NOT_FOUND);
      }
      return servicing;
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  async update(
    id: number,
    body: UpdateServicingDto,
    file?: any,
  ): Promise<string> {
    const existingService = await this.servicingRepository.findOne({
      id: Number(id),
    });

    if (!existingService) {
      throw new HttpException("Servicio no encontrado", HttpStatus.NOT_FOUND);
    }

    let imageUrl = existingService.key;

    if (file) {
      const dataFileSaved = {
        file,
        name: body.name ?? existingService.name,
        category: "servicing",
      };

      const [uploadError, uploadedUrl] = await to(
        this.filesService.uploadFile(dataFileSaved),
      );
      if (uploadError || !uploadedUrl) {
        throw new HttpException(
          uploadError || "Error al subir la imagen",
          HttpStatus.BAD_REQUEST,
        );
      }

      imageUrl = uploadedUrl;
    }

    const updatedService = {
      ...existingService,
      ...body,
      key: imageUrl,
    };

    const [updateError] = await to(
      this.servicingRepository.save(updatedService),
    );

    if (updateError) {
      throw new HttpException(updateError, HttpStatus.BAD_REQUEST);
    }

    return "Servicio actualizado correctamente";
  }

  async remove(id: number): Promise<string> {
    try {
      const [error, data] = await to(this.servicingRepository.delete(id));
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return "Servicio eliminado con éxito";
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
