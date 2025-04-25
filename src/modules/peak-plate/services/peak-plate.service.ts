import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import axios from "axios";
import * as cheerio from "cheerio";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PeakPlateRestriction } from "../entities/peak-plate.entity";
import { PeakPlateRepository } from "../repositories/peak-plate.repository";

@Injectable()
export class PeakPlateService {
  private BASE_URL = "https://www.pyphoy.com"; //TODO: Cambiar por la URL correcta

  constructor(
    @InjectRepository(PeakPlateRestriction)
    private readonly peakPlateRepo: Repository<PeakPlateRestriction>,
    private readonly peakPlateRepository: PeakPlateRepository,
  ) {}

  // Función para extraer el contenido del push de Next.js
  private extraerContenidoPush(script: string): any | null {
    const regex = /self\.__next_f\.push\(\[1,("([\s\S]*?)")\]\)/;
    const match = script.match(regex);
    if (!match || !match[2]) {
      return null;
    }
    let contenido = match[2];
    try {
      contenido = JSON.parse('"' + contenido + '"');
    } catch (e) {
      return null;
    }
    const indexBracket = contenido.indexOf("[");
    if (indexBracket === -1) {
      return null;
    }
    const jsonPart = contenido.substring(indexBracket);
    try {
      const parsed = JSON.parse(jsonPart);
      return parsed;
    } catch (e) {
      return null;
    }
  }

  private buscarCategoryData(data: any): any | null {
    if (data && typeof data === "object") {
      if (data.hasOwnProperty("categoryData")) {
        return data.categoryData;
      }
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const res = this.buscarCategoryData(data[key]);
          if (res) return res;
        }
      }
    }
    return null;
  }

  private transformRestriction(r: any): any {
    // Construir la fecha en formato "YYYY-MM-DD"
    const dayStr = r.day.toString().padStart(2, "0");
    const monthStr = r.month.toString().padStart(2, "0");
    const date = `${r.year}-${monthStr}-${dayStr}`;
    let hours: string[] = [];
    if (Array.isArray(r.hours)) {
      hours = r.hours.map((period: any) => {
        if (Array.isArray(period)) {
          return period.join("-");
        } else if (period && period.hours) {
          return period.hours.join("-");
        }
        return period;
      });
    }
    const hasRestriction =
      (Array.isArray(r.numbers) && r.numbers.length > 0) ||
      (Array.isArray(hours) && hours.length > 0 && hours[0] !== "");

    return {
      date,
      restrictedPlates: Array.isArray(r.numbers) ? r.numbers : [],
      hours,
      excludedDays: Array.isArray(r.excludedDays) ? r.excludedDays : [],
      hasRestriction,
    };
  }

  async getLatestByPlate(
    plate: string,
  ): Promise<PeakPlateRestriction | undefined> {
    try {
      return await this.peakPlateRepository.getLatestByPlate(plate);
    } catch (error) {
      throw new HttpException(
        "Error al obtener datos de PeakPlate",
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async getData(city: string, type: string, plate: string) {
    try {
      const url = `${this.BASE_URL}/${city}/${type}`;
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      const scripts = $("script")
        .toArray()
        .map((el) => $(el).html())
        .filter((s) => s && s.includes("self.__next_f.push"));
      let categoryData: any = null;
      for (const script of scripts) {
        const parsedPush = this.extraerContenidoPush(script);
        if (parsedPush) {
          categoryData = this.buscarCategoryData(parsedPush);
          if (categoryData) break;
        }
      }
      if (!categoryData) {
        return { type, message: "No valid data found.", restrictions: [] };
      }
      const restrictions = Array.isArray(categoryData.data)
        ? categoryData.data.map(this.transformRestriction)
        : [];
      return {
        type,
        message:
          restrictions.length > 0
            ? `Found ${restrictions.length} restrictions.`
            : "No restrictions for this day.",
        restrictions,
      };
    } catch (error) {
      return { type, message: "Error fetching data.", restrictions: [] };
    }
  }

  async get(city: string, plate: string): Promise<any> {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // Valores de 1 a 12

      /*const existing = await this.peakPlateRepo.findOne({
        where: { city, plate, year, month },
      });
      if (existing) {
        return existing;
      }*/

      const dataResponse = await this.getData(city, "particulares", plate);
      console.log("dataResponse", dataResponse);

      const daysInMonth = new Date(year, month, 0).getDate();
      const dailyRestrictions = [];

      let restrictionTime = 'Sin restricción';

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dateObj = new Date(dateStr);
        const isToday = day === now.getDate();
        const isFutureOrToday = dateObj >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
        const restrictionForDay = dataResponse.restrictions.find(
          (r: any) => r.date === dateStr,
        );
      
        let active = false;
      
        if (
          //isFutureOrToday &&
          restrictionForDay &&
          restrictionForDay.hasRestriction
        ) {
          const lastDigit = plate.slice(-1); // string
          const rawPlates = restrictionForDay.restrictedPlates || [];
          const plateList = rawPlates.flat().map(p => p.toString());
        
          console.log('dejarme',restrictionForDay);
        

          if (restrictionForDay.date === '2025-04-14') {
            console.log("🔍 Día 14 - Placas restringidas reales:", plateList);
            console.log("🔍 Último dígito de la placa:", lastDigit);
          }
        
          active = plateList.includes(lastDigit);
        
          if (isToday && active) {
            restrictionTime = restrictionForDay.hours?.join(", ") || "No aplica";
          }
        }
        
      
        dailyRestrictions.push({
          day,
          status: active,
        });
      }

      const newPeakPlate = this.peakPlateRepo.create({
        city,
        plate,
        year,
        month,
        dailyRestrictions,
        restrictionTime,
      });
      await this.peakPlateRepo.save(newPeakPlate);
      return newPeakPlate;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
