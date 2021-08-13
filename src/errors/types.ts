export class ApiError extends Error {
  customMessage = '';

  constructor(message: string, customMessage: string) {
    super(message);
    this.name = 'ApiError';
    this.customMessage = customMessage;
  }
}
