import { PrismaClient } from '@prisma/client';
import pg from 'pg';

const { Pool } = pg;

const prisma = new PrismaClient();

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default prisma;
export { pgPool };
