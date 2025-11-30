export abstract class HttpError extends Error {
  constructor(message: string, public readonly code: number) {
    super(message);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string = "Bad Request") {
    super(message, 400);
  }
}
