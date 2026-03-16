// ============================================
// EXPORTACIÓN DE MIDDLEWARE
// ============================================

export {
  authenticate,
  authorize,
  authorizeCourseInstructor,
  requireEnrollment,
  requireVerifiedEmail,
  optionalAuth
} from './auth';

export {
  errorHandler,
  asyncHandler,
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError
} from './errorHandler';

export {
  validate,
  requestValidator,
  isValidMongoId,
  isValidEmail,
  isValidPassword,
  isValidURL,
  sanitizeString,
  sanitizeHTML
} from './validator';
