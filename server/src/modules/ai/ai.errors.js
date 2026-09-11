import { ApiError } from '../../utils/api-error.js';

export class AIQuotaExceededError extends ApiError {
  constructor(message = 'Daily AI usage quota exceeded. Please try again tomorrow.') {
    super(429, message);
    this.name = 'AIQuotaExceededError';
  }
}

export class AIGroundingError extends ApiError {
  constructor(message = 'The provided query could not be grounded in retrieved classroom resources.') {
    super(422, message);
    this.name = 'AIGroundingError';
  }
}

export class AIPromptInjectionError extends ApiError {
  constructor(message = 'Input rejected due to detected prompt injection or security policy violation.') {
    super(400, message);
    this.name = 'AIPromptInjectionError';
  }
}

export class AIServiceUnavailableError extends ApiError {
  constructor(message = 'The AI service is currently unavailable or returning invalid output. Please try again.') {
    super(503, message);
    this.name = 'AIServiceUnavailableError';
  }
}
