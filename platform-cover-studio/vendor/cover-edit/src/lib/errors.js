export class CoverEditError extends Error {
  constructor(message, meta = {}) {
    super(message);
    this.name = 'CoverEditError';
    this.meta = meta;
  }
}
