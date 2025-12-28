import path from 'node:path'

// Load environment variables from .env file
import 'dotenv/config'

// Use DATABASE_URL if set, otherwise build from individual parts (for Docker)
const databaseUrl =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST || 'postgres'}:5432/${process.env.POSTGRES_DB}`

export default {
  schema: path.join(__dirname, 'schema.prisma'),
  datasource: {
    url: databaseUrl,
  },
}
