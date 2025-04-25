import { HttpException, HttpStatus, Injectable, Query } from "@nestjs/common";
import { CityRepository } from "../repositories/city.repository";
import { City } from "../entities/city.entity";
import { CreateCityDto, UpdateCityDto } from "../schemas/city.schema";
import to from "await-to-js";
import { PageDto, PageOptionsDto } from "@/common";

@Injectable()
export class CityService {
  constructor(private readonly cityRepository: CityRepository) {}

  async create(body: CreateCityDto): Promise<City> {
    try {
      const existingColor = await this.cityRepository.findOne({
        cityName: body.cityName,
      });
      if (existingColor) {
        throw new HttpException("La ciudad ya existe", HttpStatus.BAD_REQUEST);
      }
      const Color = new City();
      Color.cityName = body.cityName;

      const [error, newColor] = await to(this.cityRepository.save(Color));
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return newColor;
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<City>> {
    try {
      const [error, data] = await to(
        this.cityRepository.findAll(pageOptionsDto),
      );
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {
    try {
      const Color = await this.cityRepository.findOne({ id });
      if (!Color) {
        throw new HttpException("Ciudad no encontrada", HttpStatus.NOT_FOUND);
      }
      return Color;
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateCityDto): Promise<string> {
    try {
      const [error, data] = await to(this.cityRepository.update(id, dto));
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number) {
    try {
      const [error, data] = await to(this.cityRepository.remove(id));
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
