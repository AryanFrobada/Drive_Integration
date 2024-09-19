import { Response } from "express";

export const setCookie = (res: Response, name: string, value: string) => {
  res.cookie(name, value, {
    httpOnly: true,
    path: "/",
    domain: "localhost",
    secure: false,
    sameSite: "lax",
  });
};
