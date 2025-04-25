import { Request } from "express";

export type GeneralResponse<T> = {
  data: T;
};
