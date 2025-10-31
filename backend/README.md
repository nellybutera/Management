
## Quick start
1. Copy `.env.example` to `.env` and update `DATABASE_URL` and `JWT_SECRET`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client and run migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. Start dev server:
   ```bash
   npm run start:dev
   ```

## Notes
- This is a scaffold intended for rapid development. Extend modules under `src/modules`.
- Seed script: `npm run seed` (requires ts-node).
