import pg from 'pg';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const { Pool } = pg;
let poolPromise;

async function getSecret() {
  if (!process.env.DB_SECRET_ARN) return null;
  const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
  const result = await client.send(
    new GetSecretValueCommand({ SecretId: process.env.DB_SECRET_ARN })
  );
  return JSON.parse(result.SecretString);
}

async function createPool() {
  const secret = await getSecret();
  const config = secret
    ? {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME,
        user: secret.username,
        password: secret.password,
        ssl: { rejectUnauthorized: false },
        max: 4,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 5000
      }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: false,
        max: 4,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 5000
      };

  return new Pool(config);
}

export async function getPool() {
  if (!poolPromise) poolPromise = createPool();
  return poolPromise;
}

export async function query(text, values = []) {
  const pool = await getPool();
  return pool.query(text, values);
}
