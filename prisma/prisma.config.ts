import path from 'node:path'
import type { PrismaConfig } from 'prisma'

// Load environment variables from .env file
import 'dotenv/config'

export default {
  earlyAccess: [],
  schema: path.join(__dirname, 'schema.prisma'),
} satisfies PrismaConfig
