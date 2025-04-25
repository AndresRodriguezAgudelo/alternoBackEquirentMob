import getConfig from "../../config/environment/local";

const config = getConfig();

export const emailConfig = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
};
