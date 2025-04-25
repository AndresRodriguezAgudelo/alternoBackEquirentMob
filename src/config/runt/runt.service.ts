import { Injectable, Logger } from "@nestjs/common";
import { RuntConfig } from "@/common/utils/RuntConfig";
import { HttpService } from "@nestjs/axios";
import { inspect } from "util";
import { AxiosResponse } from "axios";
@Injectable()
export class RuntService {
  private readonly baseUrl: string = process.env.BASE_URL_RUNT;
  private logger = new Logger("RuntService");
  private cachedToken: { token: string; expiresAt: number } | null = null;
  private tokenPromise: Promise<string> | null = null;

  constructor(private readonly httpService: HttpService) {}

  async getToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && now < this.cachedToken.expiresAt) {
      return this.cachedToken.token;
    }
    if (this.tokenPromise) {
      return this.tokenPromise;
    }
    this.tokenPromise = (async () => {
      try {
        this.logger.log("Obteniendo token");
        const response = await this.httpService
          .post(
            `${this.baseUrl}/administracion/autenticar/credenciales`,
            RuntConfig,
          )
          .toPromise();
        const token = response.data;
        //CACHED TOKEN
        this.cachedToken = {
          token,
          expiresAt: Date.now() + 5 * 60 * 1000,
        };
        this.logger.log(
          "Token obtenido: " + inspect(response.data, { depth: 2 }),
        );
        return token;
      } catch (error) {
        throw new Error(`Error obteniendo token: ${error.message}`);
      } finally {
        this.tokenPromise = null;
      }
    })();
    return this.tokenPromise;
  }

  async queryPlate(plate: string): Promise<any> {
    try {
      const token = await this.getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = (await this.httpService
        .get(`${this.baseUrl}/RUNT/Consulta?Plate=${plate}`, {
          headers,
          signal: controller.signal,
        })
        .toPromise()) as AxiosResponse<any>;

      clearTimeout(timeoutId);
      return response.data;
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error(`Timeout al consultar la placa ${plate}`);
      }
      throw new Error(`Error consultando placa ${plate}: ${error.message}`);
    }
  }
}
