import { NextFunction, Request, Response } from "express";
import { TErrorResponse, TErrorSources } from "../interfaces/errorInterface";
import status from "http-status";
import z from "zod";
import { handleZodError } from "../errorHelpers/handleZodError";
import AppError from "../errorHelpers/AppError";


const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): TErrorResponse => {
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong";
  let stack: string | undefined = undefined;
  let errorSources: TErrorSources[] = [];

  if (err instanceof z.ZodError) {
    const zodError = handleZodError(err);
    message = zodError.message;
    statusCode = zodError.statusCode;
    errorSources = zodError.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [{ path: "", message: err.message }];
  } else if (err instanceof Error) {
    statusCode = status.BAD_REQUEST;
    message = err.message;
    stack = err.stack;
    errorSources = [{ path: "", message: err.message }];
  }

  return {
    success: false,
    message,
    statusCode,
    errorSources,
    error:err,
    stack: stack || undefined,
  };
};
