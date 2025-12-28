import 'dotenv/config'
import { defineConfig } from 'prisma/config'

const databaseUrl =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.POSTGRES_USER || 'analytics'}:${process.env.POSTGRES_PASSWORD || 'analytics_dev'}@${process.env.POSTGRES_HOST || 'localhost'}:5432/${process.env.POSTGRES_DB || 'analytics'}`

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: databaseUrl,
  },
})
