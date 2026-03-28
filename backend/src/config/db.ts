import dotenv from "dotenv";
import mysql, { Pool } from "mysql2/promise";

dotenv.config();

let pool: Pool | null = null;

const getRequiredEnv = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

export const getDbPool = (): Pool => {
  if (pool) {
    return pool;
  }

  pool = mysql.createPool({
    host: getRequiredEnv("DB_HOST", "localhost"),
    port: Number(process.env.DB_PORT ?? 3306),
    user: getRequiredEnv("DB_USER", "root"),
    password: process.env.DB_PASSWORD ?? "",
    database: getRequiredEnv("DB_NAME", "MOREBI"),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return pool;
};

export const testDbConnection = async (): Promise<void> => {
  const dbPool = getDbPool();
  await dbPool.query("SELECT 1");
};
