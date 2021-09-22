export class ApiError extends Error {
  customMessage = '';
  code = -1;

  constructor(message: string, customMessage: string, code: number) {
    super(message);
    this.name = 'ApiError';
    this.customMessage = customMessage;
    this.code = code;
  }
}
