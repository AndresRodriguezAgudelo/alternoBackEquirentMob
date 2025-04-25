import { Injectable } from "@nestjs/common";
import { renderFile } from "pug";
import { join } from "path";

@Injectable()
export class TemplatesService {
  private readonly templates: string = join(
    process.cwd(),
    "src",
    "modules",
    "templates",
    "designs",
    "blocks",
  );

  private readonly quotedPrintable = (template: string): string => {
    return template;
  };

  update = (params: any) => {
    if (params.template == "register") {
      return this.quotedPrintable(
        renderFile(join(this.templates, "register.pug"), params),
      );
    } else if (params.template == "updatePassword") {
      return this.quotedPrintable(
        renderFile(join(this.templates, "updatePassword.pug"), params),
      );
    } else if (params.template == "recoveryOtp") {
      return this.quotedPrintable(
        renderFile(join(this.templates, "recovery-otp.pug"), params),
      );
    }
  };
}
