import { PageOptionsDto } from "@/common";
import { FormatValue } from "@/common/utils/FormatValues";
import { HeaderTranslations } from "@/common/utils/TranslationHeaders";
import { EndpointData } from "@/interfaces/endpointsData.interface";
import { QueryHistoryService } from "@/modules/query-history/services/query-history.service";
import { UserService } from "@/modules/user/services/user.service";
import { Injectable } from "@nestjs/common";
import * as ExcelJS from "exceljs";
import { Response } from "express";

@Injectable()
export class ReportsService {
  constructor(
    private readonly userService: UserService,
    private readonly queryHistoryService: QueryHistoryService,
  ) {}

  async getExcelReport(
    module: string,
    pageOptionsDto: PageOptionsDto,
    res: Response,
  ): Promise<any> {
    if (module !== "users" && module !== "querys" && module !== "payments") {
      return res.status(400).json({ message: "El módulo no es válido" });
    }

    let endpointData = {};
    if (module === "users") {
      const users = await this.userService.findAll(pageOptionsDto);
      endpointData = {
        Usuarios: {
          data: users.data,
          meta: users.meta,
        },
      };
    } else if (module === "querys") {
      const queryHistory = await this.queryHistoryService.findAll(
        pageOptionsDto,
      );
      endpointData = {
        "Historial de consultas": {
          data: queryHistory.data,
          meta: queryHistory.meta,
        },
      };
    } else if (module === "payments") {
      const paymets = await this.queryHistoryService.findAll(pageOptionsDto);
      console.log(paymets);
      endpointData = {
        Pagos: paymets.data,
        meta: paymets.meta,
      };
    }

    await this.generateExcelReports(endpointData, res);
  }

  async generateExcelReports(
    endpointsData: Record<string, EndpointData>,
    res: Response,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();

    for (const [endpoint, data] of Object.entries(endpointsData)) {
      const sheetName = endpoint.toString().replace(/\s/g, "_");
      const worksheet = workbook.addWorksheet(sheetName);
      worksheet.properties.tabColor = { argb: "FF0E5D9D" };
      if (data.data && data.data.length > 0) {
        const headers = Object.keys(data.data[0]);
        const translatedHeaders = headers.map(
          (header) => HeaderTranslations[header] || header,
        );
        const headerRow = worksheet.addRow(translatedHeaders);
        headerRow.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF0E5D9D" },
          };
          cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        });
        data.data.forEach((item) => {
          const row = headers.map((header) => FormatValue(item[header]));
          worksheet.addRow(row);
        });
        worksheet.columns.forEach((column) => {
          let maxLength = 10;
          column.eachCell({ includeEmpty: true }, (cell) => {
            const cellValue = cell.value ? cell.value.toString() : "";
            if (cellValue.length > maxLength) {
              maxLength = cellValue.length;
            }
          });
          column.width = maxLength + 2;
        });
      }
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", "attachment; filename=reporte.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  }
}
