# Database operations

Production RDS is private. Do not run migrations from an arbitrary laptop unless it has a secure network path into the VPC.

For development, use the local PostgreSQL scripts:

```bash
npm run db:migrate --workspace backend
npm run db:seed --workspace backend
```

The migration files are idempotent where practical and tracked in `schema_migrations`.

The attendance unique constraint `(member_id, attendance_date)` is the final database-level protection against duplicate attendance.
