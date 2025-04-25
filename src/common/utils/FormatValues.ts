import { HeaderTranslations } from "./TranslationHeaders";

function FormatValue(value: any): string {
  if (value instanceof Date) {
    return value.toLocaleString();
  }
  if (Array.isArray(value)) {
    return value.map((item) => FormatValue(item)).join("\n");
  } else if (typeof value === "object" && value !== null) {
    return Object.entries(value)
      .map(([key, val]) => {
        const translatedKey = HeaderTranslations[key] || key;
        return `${translatedKey}: ${FormatValue(val)}`;
      })
      .join(", ");
  }
  return String(value);
}
export { FormatValue };
