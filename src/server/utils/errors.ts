import { Prisma } from '@prisma/client';

export class DatabaseError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export function handleDatabaseError(error: unknown): DatabaseError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return new DatabaseError('A unique constraint would be violated.', 'UNIQUE_VIOLATION');
      case 'P2003':
        return new DatabaseError('A foreign key constraint would be violated.', 'FOREIGN_KEY_VIOLATION');
      case 'P2025':
        return new DatabaseError('Record not found.', 'NOT_FOUND');
      case 'P2014':
        return new DatabaseError('The change you are trying to make would violate the required relation.', 'RELATION_VIOLATION');
      case 'P2016':
        return new DatabaseError('Query interpretation error.', 'QUERY_INTERPRETATION');
      case 'P2024':
        return new DatabaseError('Connection timeout. Please try again.', 'TIMEOUT');
      default:
        return new DatabaseError('An unexpected database error occurred.', 'UNKNOWN');
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new DatabaseError('Invalid data provided.', 'VALIDATION_ERROR');
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new DatabaseError('Failed to connect to the database.', 'CONNECTION_ERROR');
  }

  return new DatabaseError('An unexpected error occurred.', 'UNKNOWN');
}