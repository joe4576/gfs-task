import { HttpError } from "@/lib/errors/errors";
import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof HttpError) {
    return res.status(err.code).json({
      message: err.message,
    });
  }

  res.status(500).json({
    message: "Internal Server Error",
  });
};
