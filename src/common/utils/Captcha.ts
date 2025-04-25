import axios from "axios";
import * as FormData from "form-data";
import { sha256 } from "js-sha256";

interface CaptchaChallengeData {
  question: string;
  recommended_difficulty: number;
  time?: number;
}

interface CaptchaResponse {
  error: boolean;
  data: CaptchaChallengeData;
}

interface SolveCaptchaResult {
  verify_array: {
    question: string;
    time: number;
    nonce: number;
  };
  nonce: number;
  hash: string;
}

/**
 * Calcula el porcentaje completo (redondeado hacia abajo).
 * @param percentFor - Numerador.
 * @param percentOf - Denominador.
 * @returns Porcentaje entero.
 */
export const getWholePercent = (percentFor: number, percentOf: number): number => {
  return Math.floor((percentFor / percentOf) * 100);
};

/**
 * Determina si un número es primo.
 * @param value Número a evaluar.
 * @returns true si es primo; false de lo contrario.
 */
export const isPrime = (value: number): boolean => {
  if (value <= 1) return false;
  for (let i = 2; i < value; i++) {
    if (value % i === 0) {
      return false;
    }
  }
  return true;
};

/**
 * Resuelve el captcha buscando un nonce tal que:
 * - El hash de JSON({ question, time, nonce }) comience con "0000".
 * - El nonce sea un número primo.
 * @param data Objeto con al menos { question, time }.
 * @param nonce Valor inicial (por defecto 1).
 * @returns Objeto con la verificación, el nonce y el hash resultante.
 */
export const solveCaptcha = (data: CaptchaChallengeData, nonce: number = 1): SolveCaptchaResult => {
  nonce++;  // Incrementa inicialmente
  let verifyArray = {
    question: data.question,
    time: data.time as number,
    nonce: nonce,
  };
  let verifyJson = JSON.stringify(verifyArray);
  let currentHash = sha256(verifyJson);

  // Incrementa el nonce hasta que se cumplan las condiciones
  while (currentHash.substr(0, 4) !== "0000" || !isPrime(nonce)) {
    nonce++;
    verifyArray = {
      question: data.question,
      time: data.time as number,
      nonce: nonce,
    };
    verifyJson = JSON.stringify(verifyArray);
    currentHash = sha256(verifyJson);
  }
  return {
    verify_array: verifyArray,
    nonce,
    hash: currentHash,
  };
};

/**
 * Realiza la petición al servicio de captcha para obtener el desafío.
 * Se envía un form-data con el campo "endpoint"="question".
 * @returns Promesa que resuelve con la respuesta del captcha.
 */
export async function getCaptchaChallenge(): Promise<CaptchaResponse> {
  const form = new FormData();
  form.append("endpoint", "question");

  const headers = {
    ...form.getHeaders(),
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive",
    "Origin": "https://www.fcm.org.co",
    "Referer": "https://www.fcm.org.co/",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "cross-site",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15"
  };

  const response = await axios.post("https://qxcaptcha.quipux.com/api.php", form, { headers }); //FIXME: Mover a .env
  return response.data;
}

/**
 * Flujo completo para resolver el captcha, realizar la consulta y
 * transformar la respuesta al formato esperado.
 * @param filtro El identificador (por ejemplo, la placa o número de documento).
 * @returns Promesa con la respuesta transformada del servicio de consulta.
 */
export async function getFines(filtro: string): Promise<any> {
  // 1. Obtener el desafío del captcha
  const captchaResponse = await getCaptchaChallenge();
  if (captchaResponse.error) {
    throw new Error("Error al obtener el captcha");
  }
  const challengeData = captchaResponse.data;
  // Genera el tiempo si no viene en la respuesta.
  challengeData.time = Math.floor(Date.now() / 1000);
  const difficulty = challengeData.recommended_difficulty || 1;

  // 2. Resolver el captcha según la dificultad
  let verificationResults: { question: string; time: number; nonce: number }[] = [];
  let nonce = 1;
  console.log("Resolviendo captcha...");
  for (let i = 0; i < difficulty; i++) {
    const result = solveCaptcha(challengeData, nonce);
    nonce = result.nonce; // Actualiza para la siguiente iteración
    verificationResults.push(result.verify_array);
    const percentDone = getWholePercent(i + 1, difficulty);
    console.log(`Proceso de verificación: ${percentDone}% completado.`);
  }
  console.log("Captcha resuelto con éxito:", verificationResults);

  // Enviar solo la última verificación pero dentro de un array.
  const lastVerification = verificationResults[verificationResults.length - 1];

  const payloadConsulta = {
    filtro,
    reCaptchaDTO: {
      response: JSON.stringify([lastVerification]),
      consumidor: "1",
    }
  };
  console.log("\nPayload para la consulta:");
  console.log(JSON.stringify(payloadConsulta, null, 2));

  // Realizar la petición al servicio de consulta
  const consultaHeaders = {
    "Content-Type": "application/json",
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive",
    "Origin": "https://www.fcm.org.co",
    "Referer": "https://www.fcm.org.co/",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15"
  };

  const consultaResponse = await axios.post(
    "https://consultasimit.fcm.org.co/simit/microservices/estado-cuenta-simit/estadocuenta/consulta", //FIXME: Mover a .env
    payloadConsulta,
    { headers: consultaHeaders }
  );
  console.log("\nRespuesta del servicio de consulta:");
  console.log(JSON.stringify(consultaResponse.data, null, 2));

  return transformFines(consultaResponse.data, filtro);
}

/**
 * Transforma la respuesta del servicio de consulta al formato final esperado.
 * @param raw Respuesta original del servicio.
 * @returns Objeto formateado.
 */
/**
 * Transforma la respuesta del servicio de consulta al formato final esperado.
 * @param raw Respuesta original del servicio.
 * @returns Objeto formateado.
 */
function transformFines(raw: any, filtro: string): any {
  const multas = raw.multas || [];
  const comparendos = raw.comparendos || [];
  const totalItems = multas.length + comparendos.length;

  if (totalItems === 0) {
    return {
      comparendos_multas: 0,
      totalPagar: 0,
      mensaje: "✅ No hay multas ni comparendos pendientes.",
      placa: filtro,
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

  const totalPagar = multas.reduce((sum: number, multa: any) => sum + (multa.valorPagar || 0), 0);
  const mensaje = `🚨 Tiene ${comparendos.length} comparendo(s) - ${multas.length} multa(s) pendiente(s) por pagar `;

  const detallesComparendos = multas.map((multa: any) => {
    // Se usa "numeroComparendo" o "numeroResolucion" para identificar la multa.
    let numeroMulta = multa.numeroComparendo || multa.numeroResolucion || "N/A";
    if (numeroMulta !== "N/A" && numeroMulta.length > 9) {
      numeroMulta = numeroMulta.substring(numeroMulta.length - 9);
    }
    // Se extrae la fecha (usando el campo "fechaComparendo" si existe).
    let fecha = multa.fechaComparendo ? multa.fechaComparendo.split(" ")[0] : "N/A";
    // Se extrae la infracción: se toma la primera de la lista.
    let codigoInfraccion = "N/A", descripcionInfraccion = "N/A";
    if (Array.isArray(multa.infracciones) && multa.infracciones.length > 0) {
      codigoInfraccion = multa.infracciones[0].codigoInfraccion || "N/A";
      descripcionInfraccion = multa.infracciones[0].descripcionInfraccion || "N/A";
    }
    // Estado y valorPagar se toman directamente.
    let estado = multa.estadoCartera || "N/A";
    let valorPagar = multa.valorPagar || 0;

    console.log("\nDetalle de la multa:");
    console.log(JSON.stringify(multa, null, 2));
    // Para detalleValor: si la multa ya trae este objeto, se usa sus valores; de lo contrario se asignan "N/A".
    const detalleValor = multa.detalleValor
      ? {
          valorBase: multa.detalleValor.valorBase || "N/A",
          descuentoCapital: multa.detalleValor.descuentoCapital || "N/A",
          intereses: multa.detalleValor.intereses || "N/A",
          descuentoIntereses: multa.detalleValor.descuentoIntereses || "N/A",
          valorAdicional: multa.detalleValor.valorAdicional || "N/A",
        }
      : {
          valorBase: "N/A",
          descuentoCapital: "N/A",
          intereses: "N/A",
          descuentoIntereses: "N/A",
          valorAdicional: "N/A",
        };

    return {
      numeroMulta,
      fecha,
      codigoInfraccion,
      descripcionInfraccion,
      estado,
      valorPagar,
      detalleValor,
    };
  });

  return {
    comparendos_multas: totalItems,
    totalPagar,
    mensaje,
    placa: filtro,
    detallesComparendos,
  };
}

