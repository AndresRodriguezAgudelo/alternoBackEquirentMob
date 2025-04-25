import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { PageDto, PageMetaDto, PageOptionsDto } from "@/common";
import { throwCustomError } from "@/common/utils/Error";
import { City } from "../entities/city.entity";
import { ICity } from "@/interfaces/city.interface";
import { UpdateCityDto } from "../schemas/city.schema";

@Injectable()
export class CityRepository {
  constructor(
    @InjectRepository(City)
    private readonly repository: Repository<City>,
    private readonly dataSource: DataSource,
  ) {}

  public async save(city: City): Promise<City> {
    return this.repository.save(city);
  }

  public async findOne(data: ICity): Promise<City> {
    const city = await this.repository.findOne({
      where: { ...data },
    });
    return city;
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<City>> {
    const queryBuilder = this.repository.createQueryBuilder("cities");
    queryBuilder.select(["cities.id", "cities.cityName"]);
  
    if (!pageOptionsDto.search) {
      // Si no se envía "search", se retorna por default el listado de ciudades predefinido.
      const defaultCities = [
        'Bogota',
        'Medellin',
        'Cali',
        'Bucaramanga',
        'Armenia',
        'Pasto',
        'Barranquilla',
        'Cartagena',
        'Santa Marta',
        'Manizales',
        'Pereira',
        'Cucuta',
        'Villavicencio',
        'Tunja',
        'Ibague',
        'Popayan'
      ];
      queryBuilder.where("cities.cityName IN (:...defaultCities)", { defaultCities });
      queryBuilder.orderBy("cities.cityName", pageOptionsDto.order);
      // No se aplica paginación, ya que el listado es fijo.
    } else {
      // Si se envía "search", se filtra en todos los registros sin paginación.
      queryBuilder.where("LOWER(cities.cityName) LIKE LOWER(:search)", {
        search: `%${pageOptionsDto.search}%`,
      });
      queryBuilder.orderBy("cities.cityName", pageOptionsDto.order);
      // Se omiten los métodos .skip() y .take() para que retorne todos los registros coincidentes.
    }
  
    const total = await queryBuilder.getCount();
    const cities = await queryBuilder.getMany();
  
    // Se crea la metadata de la página. Aunque en ambos casos se retorna un listado no paginado, se mantiene el formato de PageDto.
    const pageMetaDto = new PageMetaDto({ total, pageOptionsDto });
    return new PageDto(cities, pageMetaDto);
  }
  

  async update(id: number, updateCityDto: UpdateCityDto): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const city = await queryRunner.manager.findOne(City, { where: { id } });

      if (!city) {
        await queryRunner.rollbackTransaction();
        throwCustomError("city_not_found");
      }

      const existingcity = await queryRunner.manager.findOne(City, {
        where: { cityName: updateCityDto.cityName },
      });

      if (existingcity && existingcity.id !== id) {
        await queryRunner.rollbackTransaction();
        throwCustomError("city_exists");
      }

      city.cityName = updateCityDto.cityName;

      await queryRunner.manager.save(city);
      await queryRunner.commitTransaction();

      return "Ciudad actualizada correctamente";
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throwCustomError("city_error");
    } finally {
      await queryRunner.release();
    }
  }

  public async remove(id: number): Promise<any> {
    try {
      const city = await this.findOne({ id });

      if (!city) {
        throwCustomError("city_not_found");
      }
      return await this.repository.delete(id);
    } catch (error) {
      throwCustomError("city_error");
    }
  }
}
