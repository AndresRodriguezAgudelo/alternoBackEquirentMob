import getConfig from "../../config/environment/local";

const config = getConfig();

export const RuntConfig = {
  strUsuario: config.RUNT_USER,
  strContrasena: config.RUNT_PASS,
  strNIT: config.RUNT_NIT,
  strRazonSocial: "",
};
