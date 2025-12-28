import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// For migrations (run from host): use localhost
// For app runtime (inside Docker): use postgres
const host = process.env.POSTGRES_HOST || 'localhost'
const databaseUrl =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.POSTGRES_USER || 'analytics'}:${process.env.POSTGRES_PASSWORD || 'analytics_dev'}@${host}:5432/${process.env.POSTGRES_DB || 'analytics'}`

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: databaseUrl,
  },
})
