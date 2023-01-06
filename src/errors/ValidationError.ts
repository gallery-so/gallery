export class ValidationError extends Error {
  public validationMessage: string;

  constructor(validationMessage: string) {
    super(`Validation Error: ${validationMessage}`);

    this.validationMessage = validationMessage;

    Object.setPrototypeOf(this, Error.prototype);
  }
}
