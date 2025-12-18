# The Mens Hair

Mobile-first barber appointment system

## Tech Stack

- **Next.js** - App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Prisma** - Database ORM (planned)

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
└── lib/
    └── utils.ts        # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Production Database Setup

### Prerequisites

- MySQL database instance
- `DATABASE_URL` environment variable configured

### Table Naming Strategy

This project uses a table mapping strategy where Prisma model names use PascalCase (e.g., `Barber`, `WorkingHour`, `AppointmentRequest`, `AppointmentSlot`) while database table names use lowercase snake_case (e.g., `barbers`, `working_hours`, `appointment_requests`, `appointment_slots`).

**⚠️ IMPORTANT:** Prisma model names do NOT match database table names by design. The mapping is handled via `@@map` directives in the Prisma schema:

- `Barber` model → `barbers` table
- `WorkingHour` model → `working_hours` table
- `AppointmentRequest` model → `appointment_requests` table
- `AppointmentSlot` model → `appointment_slots` table

This allows the codebase to use TypeScript-friendly PascalCase model names while maintaining database conventions with lowercase snake_case table names. When writing queries, always use the Prisma model names (e.g., `prisma.barber.findMany()`), not the database table names.

### Baseline Migration

This project uses a baseline migration approach because the MySQL user does not have permission to create shadow databases. Shadow databases are required by `prisma migrate dev` but not by `prisma migrate deploy`.

The baseline migration (`prisma/migrations/000_init/migration.sql`) was created using `prisma migrate diff` from an empty database to the current schema. This ensures production-safe migration history without requiring shadow database permissions.

### Deployment Steps

1. Generate Prisma Client:
```bash
npx prisma generate
```

2. Deploy migrations to production:
```bash
npx prisma migrate deploy
```

**⚠️ WARNING:** Never run `prisma migrate dev` in production. Use `prisma migrate deploy` instead.

### Future Migrations

All future schema changes must be applied using `prisma migrate deploy`:

1. Update `prisma/schema.prisma` with your changes
2. Generate a new migration using `prisma migrate diff`:
```bash
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/XXX_migration_name/migration.sql
```
3. Create the migration folder structure manually
4. Deploy using `prisma migrate deploy`

**Important:** Always test migrations in a development environment before deploying to production.

### Important Notes

- Seed script is disabled in production (`NODE_ENV=production`)
- Prisma Client uses singleton pattern for optimal performance
- Verbose logging is disabled in production