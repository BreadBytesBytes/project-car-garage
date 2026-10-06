declare const uuidBrand: unique symbol;
declare const utcTimestampBrand: unique symbol;

export type Uuid = string & { readonly [uuidBrand]: true };
export type UtcTimestamp = string & {
  readonly [utcTimestampBrand]: true;
};

export type EntityTimestamps = Readonly<{
  createdAt: UtcTimestamp;
  updatedAt: UtcTimestamp;
}>;

export type ArchiveState = Readonly<{
  archivedAt: UtcTimestamp | null;
}>;

export type ServiceErrorCode =
  | 'VALIDATION'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNAVAILABLE'
  | 'UNEXPECTED';

export type ServiceError = Readonly<{
  code: ServiceErrorCode;
  message: string;
  field?: string;
}>;

export type ServiceResult<T> =
  | Readonly<{ ok: true; data: T }>
  | Readonly<{ ok: false; error: ServiceError }>;

export function serviceSuccess<T>(data: T): ServiceResult<T> {
  return { ok: true, data };
}

export function serviceFailure(
  code: ServiceErrorCode,
  message: string,
  field?: string,
): ServiceResult<never> {
  return {
    ok: false,
    error: { code, message, ...(field ? { field } : {}) },
  };
}

export interface ReadRepository<TEntity, TQuery> {
  findById(id: Uuid): Promise<ServiceResult<TEntity | null>>;
  query(input: TQuery): Promise<ServiceResult<readonly TEntity[]>>;
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseUuid(input: string, field = 'id'): ServiceResult<Uuid> {
  const value = input.trim();
  return uuidPattern.test(value)
    ? serviceSuccess(value as Uuid)
    : serviceFailure('VALIDATION', 'Enter a valid UUID.', field);
}

const utcTimestampPattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|\+00:00)$/i;

export function parseUtcTimestamp(
  input: string,
  field = 'timestamp',
): ServiceResult<UtcTimestamp> {
  const match = utcTimestampPattern.exec(input);
  const date = new Date(input);

  if (
    !match ||
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== Number(match[1]) ||
    date.getUTCMonth() + 1 !== Number(match[2]) ||
    date.getUTCDate() !== Number(match[3]) ||
    date.getUTCHours() !== Number(match[4]) ||
    date.getUTCMinutes() !== Number(match[5]) ||
    date.getUTCSeconds() !== Number(match[6])
  ) {
    return serviceFailure('VALIDATION', 'Enter a valid UTC timestamp.', field);
  }

  return serviceSuccess(date.toISOString() as UtcTimestamp);
}

export function toUtcTimestamp(date: Date): ServiceResult<UtcTimestamp> {
  return Number.isNaN(date.getTime())
    ? serviceFailure('VALIDATION', 'Enter a valid date.', 'date')
    : serviceSuccess(date.toISOString() as UtcTimestamp);
}

export function isValidTimeZone(timeZone: string) {
  if (!timeZone.trim()) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

export type * from './vehicle';
