/**
 * Resta horas opcionalmente y formatea una fecha en zona Bogotá (UTC−5)
 * con formato "YYYY-MM-DD HH:mm:ss".
 *
 * @param dateInput - Fecha como Date o string ("YYYY-MM-DD HH:mm:ss.SSS" o ISO con 'T')
 * @param hoursToSubtract - Nº de horas a restar (opcional)
 * @returns Fecha formateada en Bogotá, p.ej. "2025-04-16 13:18:29"
 */
export function formatMinusHoursBogota(
    dateInput: Date | string,
    hoursToSubtract = 0
  ): string {
    const MS_PER_HOUR = 3_600_000;
    const BOGOTA_OFFSET_HOURS = 5;
  
    // Normalizar a Date UTC
    let baseDate: Date;
    if (typeof dateInput === 'string') {
      // convertir "YYYY-MM-DD HH:mm:ss.sss" o "YYYY-MM-DDTHH:mm:ss.sss" a ISO UTC
      const isoPart = dateInput.includes('T')
        ? dateInput
        : dateInput.replace(' ', 'T');
      const isoZ = isoPart.endsWith('Z') ? isoPart : `${isoPart}Z`;
      baseDate = new Date(isoZ);
    } else {
      baseDate = dateInput;
    }
  
    // Calcular timestamp UTC: resto horas a restar + offset de Bogotá
    const msTarget =
      baseDate.getTime() -
      hoursToSubtract * MS_PER_HOUR -
      BOGOTA_OFFSET_HOURS * MS_PER_HOUR;
  
    // Crear Date y extraer componentes UTC (que ahora representan hora Bogotá)
    const d = new Date(msTarget);
    const pad2 = (n: number) => n.toString().padStart(2, '0');
  
    const YYYY = d.getUTCFullYear();
    const MM = pad2(d.getUTCMonth() + 1);
    const DD = pad2(d.getUTCDate());
    const hh = pad2(d.getUTCHours());
    const mm = pad2(d.getUTCMinutes());
    const ss = pad2(d.getUTCSeconds());
  
    return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
  }
  