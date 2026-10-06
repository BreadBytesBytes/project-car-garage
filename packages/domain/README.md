# Domain and service conventions

- React screens call services; they do not contain domain rules or query Supabase directly.
- Services validate untrusted input and return `ServiceResult<T>`. Expected failures are values, not thrown exceptions.
- Repositories are persistence adapters. They map database rows/errors to domain values/results and do not expose Supabase response types outside the adapter.
- Read repositories may use `ReadRepository`; write contracts use explicit domain verbs from Appendix B, such as `archiveVehicle`, rather than generic deletion.
- Multi-entity operations remain transactional and server-side.
- Domain IDs are validated UUIDs. Stored timestamps are UTC and normalized to ISO `Z` strings. Screens render those timestamps with the account time zone.
- Archive-capable entities use an `archivedAt` lifecycle field; raw deletion is not a repository default.
