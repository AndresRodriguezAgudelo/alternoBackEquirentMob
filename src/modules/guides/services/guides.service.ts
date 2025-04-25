import { HttpException, HttpStatus, Injectable, Query } from "@nestjs/common";
import { CreateGuideDto, UpdateGuideDto } from "../schemas/guides.schema";
import { Guides } from "../entities/guides.entity";
import to from "await-to-js";
import { FilesService } from "@/modules/files/services/files.service";
import { PageDto, PageOptionsDto } from "@/common";
import { GuidesRepository } from "../repositories/guides.repository";

@Injectable()
export class GuidesService {
  constructor(
    private readonly guidesRepository: GuidesRepository,
    private readonly filesService: FilesService,
  ) {}

  async create(body: CreateGuideDto, files: any): Promise<Guides> {
    const { file, fileSecondary, fileTertiary } = files;

    if (!file) {
      throw new HttpException(
        "Imagen principal requerida",
        HttpStatus.BAD_REQUEST,
      );
    }

    const [mainError, mainImageUrl] = await to(
      this.filesService.uploadFile({
        file: file[0],
        name: body.name,
        category: "guide",
      }),
    );
    if (mainError || !mainImageUrl) {
      throw new HttpException(
        mainError || "Error al subir imagen principal",
        HttpStatus.BAD_REQUEST,
      );
    }

    let secondaryImageUrl = "";
    let tertiaryVideoUrl = "";

    if (fileSecondary) {
      const [secondaryError, secondaryUrl] = await to(
        this.filesService.uploadFile({
          file: fileSecondary[0],
          name: body.name + "_secondary",
          category: "guide",
        }),
      );
      if (!secondaryError) secondaryImageUrl = secondaryUrl;
    }

    if (fileTertiary) {
      const [tertiaryError, tertiaryUrl] = await to(
        this.filesService.uploadFile({
          file: fileTertiary[0],
          name: body.name + "_tertiary",
          category: "guide",
        }),
      );
      if (!tertiaryError) tertiaryVideoUrl = tertiaryUrl;
    }

    const guide = new Guides();
    guide.name = body.name;
    guide.description = body.description;
    guide.keyMain = mainImageUrl;
    guide.keySecondary = secondaryImageUrl;
    guide.keyTertiaryVideo = tertiaryVideoUrl;
    guide.categoryId = body.categoryId;

    const [saveError, newGuide] = await to(this.guidesRepository.save(guide));
    if (saveError) {
      throw new HttpException(saveError, HttpStatus.BAD_REQUEST);
    }

    return newGuide;
  }

  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Guides>> {
    const [error, data] = await to(
      this.guidesRepository.findAll(pageOptionsDto),
    );
    if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
    return data;
  }

  async findAllApp(@Query() pageOptionsDto: PageOptionsDto): Promise<any> {
    const [error, data] = await to(
      this.guidesRepository.findAllApp(pageOptionsDto),
    );
    if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
    const formattedData = this.formatDataByCategory(data);
    return formattedData;
  }

  formatDataByCategory(input) {
    const categoryMap = new Map();

    input.data.forEach((item) => {
      const categoryName = item.category.categoryName;
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, []);
      }
      categoryMap.get(categoryName).push({
        id: item.id,
        name: item.name,
        categoryId: item.categoryId,
        keyMain: item.keyMain,
        keySecondary: item.keySecondary,
        keyTertiaryVideo: item.keyTertiaryVideo,
        description: item.description,
        date: item.createdAt,
      });
    });

    return {
      categories: Array.from(categoryMap, ([categoryName, items]) => ({
        categoryName,
        items,
      })),
      meta: input.meta,
    };
  }

  async findOne(id: number): Promise<Guides> {
    const guide = await this.guidesRepository.findOne({ id });
    if (!guide) {
      throw new HttpException("Guía no encontrada", HttpStatus.NOT_FOUND);
    }
    return guide;
  }

  async update(id: number, body: UpdateGuideDto, files?: any): Promise<string> {
    const existingGuide = await this.guidesRepository.findOne({ id });

    if (!existingGuide) {
      throw new HttpException("Guía no encontrada", HttpStatus.NOT_FOUND);
    }

    let mainImageUrl = existingGuide.keyMain;
    let secondaryImageUrl = existingGuide.keySecondary;
    let tertiaryVideoUrl = existingGuide.keyTertiaryVideo;

    if (files?.file) {
      const [mainError, mainUrl] = await to(
        this.filesService.uploadFile({
          file: files.file[0],
          name: body.name ?? existingGuide.name,
          category: "guide",
        }),
      );
      if (!mainError) mainImageUrl = mainUrl;
    }

    if (files?.fileSecondary) {
      const [secondaryError, secondaryUrl] = await to(
        this.filesService.uploadFile({
          file: files.fileSecondary[0],
          name: body.name + "_secondary",
          category: "guide",
        }),
      );
      if (!secondaryError) secondaryImageUrl = secondaryUrl;
    }

    if (files?.fileTertiary) {
      const [tertiaryError, tertiaryUrl] = await to(
        this.filesService.uploadFile({
          file: files.fileTertiary[0],
          name: body.name + "_tertiary",
          category: "guide",
        }),
      );
      if (!tertiaryError) tertiaryVideoUrl = tertiaryUrl;
    }

    const updatedGuide = {
      ...existingGuide,
      ...body,
      keyMain: mainImageUrl,
      keySecondary: secondaryImageUrl,
      keyTertiaryVideo: tertiaryVideoUrl,
    };

    const [updateError] = await to(this.guidesRepository.save(updatedGuide));
    if (updateError) {
      throw new HttpException(updateError, HttpStatus.BAD_REQUEST);
    }

    return "Guía actualizada correctamente";
  }

  async remove(id: number): Promise<string> {
    const [error] = await to(this.guidesRepository.delete(id));
    if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
    return "Guía eliminada con éxito";
  }

  async total(): Promise<number> {
    return await this.guidesRepository.total();
  }
}
