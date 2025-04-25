import { getFines } from "@/common/utils/Captcha";
import { QueryHistoryService } from "@/modules/query-history/services/query-history.service";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { chromium, Browser, Page } from 'playwright';

// FIXME: Este scraper no se esta utilizando actualmente, puesto que el servicio de fines simit ya esta implementado mediante la vulneracion de captcha en utils
// TODO: Eliminar el scraper

@Injectable()
export class FinesSimitService {
  constructor(private readonly queryHistoryService: QueryHistoryService) {}

  private baseUrl =
    "https://www.fcm.org.co/simit/#/estado-cuenta?numDocPlacaProp="; //FIXME: MOVE THIS TO ENV

  

  // Método para retornar el resultado por defecto en caso de que no existan multas o comparendos
  private defaultResult() {
    return {
      comparendos_multas: 0,
      totalPagar: 0,
      mensaje: "✅ No hay multas ni comparendos pendientes.",
      detallesComparendos: [
        {
          numeroMulta: "N/A",
          fecha: "N/A",
          codigoInfraccion: "N/A",
          descripcionInfraccion: "N/A",
          estado: "N/A",
          valorPagar: 0,
          detalleValor: {
            valorBase: "N/A",
            descuentoCapital: "N/A",
            intereses: "N/A",
            descuentoIntereses: "N/A",
            valorAdicional: "N/A",
          },
        },
      ],
    };
  }

  async  scrapeSimit(search: string): Promise<any> {
    let browser: Browser | null = null;
    try {
      // Lanzar el navegador
      browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });
  
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
      });
      const page: Page = await context.newPage();
      const url = `${this.baseUrl}${search}`;
      console.log(`🔍 Accediendo a: ${url}`);
  
      // Navegar a la URL y esperar a que esté en estado de red inactiva
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      console.log("✅ Página cargada. Extrayendo información...");
  
      // Función auxiliar para obtener el texto de un selector con espera explícita
      const obtenerTexto = async (selector: string): Promise<string | null> => {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          const elementHandle = await page.$(selector);
          return elementHandle ? (await elementHandle.textContent())?.trim() || null : null;
        } catch (error) {
          return null;
        }
      };
  
      // Definir los selectores iniciales
      let comparendosSelector = '#resumenEstadoCuenta > div > div > div.col-lg-3.col-md-3.col-6 > span > strong';
      let multasSelector = '#resumenEstadoCuenta > div > div > div.col-lg-2.col-md-2.col-6 > span > strong';
  
      let value1 = await obtenerTexto(comparendosSelector);
      let value2 = await obtenerTexto(multasSelector);
  
      // Si no se obtienen los datos, se prueba con selectores alternativos
      if (value1 === null || value2 === null) {
        console.log("⚠️ No se encontraron los selectores iniciales, intentando con vista alternativa...");
        comparendosSelector = '#mainView > div > div.container-fluid.mb-4 > div > div.col-lg-6.px-lg-3.px-0.mt-3 > div > div > div.col-lg-3.col-md-3.col-6 > span > strong';
        multasSelector = '#mainView > div > div.container-fluid.mb-4 > div > div.col-lg-6.px-lg-3.px-0.mt-3 > div > div > div.col-lg-2.col-md-3.col-6 > span > strong';
        value1 = await obtenerTexto(comparendosSelector);
        value2 = await obtenerTexto(multasSelector);
      }
  
      if (value1 === null || value2 === null) {
        console.log("⚠️ No se encontraron selectores en ninguna vista. Se asume que no hay multas ni comparendos.");
        return this.defaultResult();
      }
  
      console.log("✅ Datos encontrados en selectores.");
      console.log("📌 Datos extraídos:", { comparendos: value1, multas: value2 });
  
      const numComparendos = parseInt(value1) || 0;
      const numMultas = parseInt(value2) || 0;
      let detallesComparendos: any[] = [];
      let totalPagar = 0;
  
      if (numComparendos > 0 || numMultas > 0) {
        console.log("🔍 Extrayendo detalles de los comparendos...");
        detallesComparendos = await page.evaluate(() => {
          const filas = Array.from(document.querySelectorAll('#multaTable > tbody > tr'));
          return filas.map(fila => {
            const tds = fila.querySelectorAll('td');
            const td1Text = tds[0]?.textContent?.replace(/\s+/g, ' ').trim() || 'N/A';
            let numeroMulta = 'N/A', fecha = 'N/A';
  
            if (td1Text.includes('Fecha coactivo:')) {
              [numeroMulta, fecha] = td1Text.split('Fecha coactivo:').map(t => t.trim());
              numeroMulta = numeroMulta.replace('Multa', '').trim();
            } else {
              const partes = td1Text.split(' ');
              numeroMulta = partes[0];
              fecha = partes[partes.length - 1];
            }
  
            const codigoInfraccionSpan = tds[4]?.querySelector('span[data-toggle="popover"]');
            const codigoInfraccion = codigoInfraccionSpan
              ?.querySelector('label span')
              ?.textContent?.trim() || 'N/A';
            const descripcionInfraccion = codigoInfraccionSpan
              ?.getAttribute('data-content')
              ?.trim() || 'N/A';
  
            const td8Text = tds[7]?.textContent?.replace(/\s+/g, ' ').trim() || 'N/A';
            const valorPagar = td8Text.match(/\$\s?([\d\.,]+)/)?.[1].replace(/\./g, '').replace(',', '') || '0';
  
            const extraerValor = (etiqueta: string) => {
              const regex = new RegExp(`${etiqueta}\\s*\\$\\s*([\\d.,]+)`);
              const match = td8Text.match(regex);
              return match ? `$${match[1].replace(/\s/g, '')}` : 'N/A';
            };
  
            return {
              numeroMulta,
              fecha,
              codigoInfraccion,
              descripcionInfraccion,
              estado: tds[5]?.textContent?.trim() || 'N/A',
              valorPagar: parseFloat(valorPagar),
              detalleValor: {
                valorBase: extraerValor('Valor'),
                descuentoCapital: extraerValor('Descuento en capital'),
                intereses: extraerValor('Intereses'),
                descuentoIntereses: extraerValor('Descuento en intereses'),
                valorAdicional: extraerValor('Valor adicional')
              }
            };
          });
        });
  
        totalPagar = detallesComparendos.reduce((acc, curr) => acc + curr.valorPagar, 0);
      } else {
        // Si no hay comparendos ni multas, se retorna un objeto por defecto
        detallesComparendos.push({
          numeroMulta: 'N/A',
          fecha: 'N/A',
          codigoInfraccion: 'N/A',
          descripcionInfraccion: 'N/A',
          estado: 'N/A',
          valorPagar: 0,
          detalleValor: {
            valorBase: 'N/A',
            descuentoCapital: 'N/A',
            intereses: 'N/A',
            descuentoIntereses: 'N/A',
            valorAdicional: 'N/A'
          }
        });
      }
  
      const resultado = {
        comparendos_multas: numComparendos + numMultas,
        totalPagar,
        mensaje: (numComparendos > 0 || numMultas > 0)
          ? `🚨 Tiene ${numComparendos} comparendo(s) - ${numMultas} multa(s) pendiente(s) por pagar`
          : `✅ No hay multas ni comparendos pendientes.`,
        detallesComparendos
      };
  
      console.log("📌 Resultado Final:", resultado);
      return resultado;
    } catch (error) {
      console.error("❌ Error en el scraping:", error);
      throw new Error(
        error.message.includes("Navigation timeout")
          ? "⏳ La página no respondió a tiempo. Intenta más tarde."
          : `❌ Ocurrió un error al consultar la página del SIMIT: ${error.message}`
      );
    } finally {
      if (browser) {
        await browser.close();
        console.log("✅ Navegador cerrado. Proceso finalizado.");
      }
    }
  }

  async getFines(search: string, user: any): Promise<any> {
    // Registrar la consulta
    await this.queryHistoryService.logQuery(user.id, "fines-simit");
    const result = await getFines(search);
    console.log("Result:", result);
    return result;
  }
}
