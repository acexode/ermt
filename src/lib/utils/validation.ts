import { AppError } from './error';

export function validateRequired(body: Record<string, any>, fields: string[]) {
  for (const field of fields) {
    if (!body[field]) {
      throw new AppError(`${field} is required`);
    }
  }
}

export function validateEnum(value: string, enumValues: string[], fieldName: string) {
  if (!enumValues.includes(value)) {
    throw new AppError(`${fieldName} must be one of: ${enumValues.join(', ')}`);
  }
}

export function validateDate(value: string, fieldName: string) {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new AppError(`${fieldName} must be a valid date`);
  }
  return date;
}

export function validateId(id: string | null, fieldName: string) {
  if (!id) {
    throw new AppError(`${fieldName} is required`);
  }
  return id;
} 
