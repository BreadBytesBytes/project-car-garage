import {
  serviceFailure,
  serviceSuccess,
  type ServiceResult,
} from '@project-car-garage/domain';

export type VinDecode = Readonly<{
  vin: string;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  warning: string | null;
}>;

type VpicRow = {
  ErrorCode?: string;
  ErrorText?: string;
  Make?: string;
  Model?: string;
  ModelYear?: string;
  Trim?: string;
};

type VpicResponse = { Results?: VpicRow[] };

const vinPattern = /^[A-HJ-NPR-Z0-9]{17}$/;

function value(input?: string) {
  const normalized = input?.trim();
  return normalized ? normalized : null;
}

export async function decodeVin(
  vin: string,
  modelYear?: number,
  request: typeof fetch = fetch,
): Promise<ServiceResult<VinDecode>> {
  const normalizedVin = vin.trim().toUpperCase();
  if (!vinPattern.test(normalizedVin)) {
    return serviceFailure(
      'VALIDATION',
      'Enter a 17-character VIN using letters and numbers.',
      'vin',
    );
  }

  const url = new URL(
    `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(normalizedVin)}`,
  );
  url.searchParams.set('format', 'json');
  if (modelYear) url.searchParams.set('modelyear', String(modelYear));

  try {
    const response = await request(url);
    if (!response.ok) {
      return serviceFailure(
        'UNAVAILABLE',
        'VIN decoding is temporarily unavailable.',
      );
    }

    const row = ((await response.json()) as VpicResponse).Results?.[0];
    const make = value(row?.Make);
    const model = value(row?.Model);
    const decodedYear = Number(row?.ModelYear);
    const year =
      Number.isInteger(decodedYear) && decodedYear > 0 ? decodedYear : null;

    if (!row || (!make && !model && !year)) {
      return serviceFailure(
        'NOT_FOUND',
        value(row?.ErrorText) ?? 'No vehicle identity was found for that VIN.',
      );
    }

    return serviceSuccess({
      vin: normalizedVin,
      year,
      make,
      model,
      trim: value(row.Trim),
      warning: row.ErrorCode === '0' ? null : value(row.ErrorText),
    });
  } catch {
    return serviceFailure(
      'UNAVAILABLE',
      'VIN decoding is temporarily unavailable.',
    );
  }
}
