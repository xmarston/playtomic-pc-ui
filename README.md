# Playtomic PC UI

A Next.js web application for Playtomic with multi-language support.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL 16 with Prisma 7 ORM
- **i18n**: react-i18next with support for 7 languages
- **Testing**: Playwright (E2E)

## Supported Languages

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Dutch (nl)
- Portuguese (pt)

## Getting Started

### Prerequisites

- Node.js 22+
- npm, yarn, pnpm, or bun
- PostgreSQL 16+ (or Docker)

### Installation

```bash
npm install
```

### Environment Setup

Copy the example environment file and configure as needed:

```bash
cp .env.example .env
```

### Database Setup

The application uses PostgreSQL with Prisma ORM for the analytics feature.

**Option 1: Using Docker (recommended)**

Start just the database container:

```bash
docker-compose -f docker-compose.dev.yaml up postgres -d
```

**Option 2: Using local PostgreSQL**

Ensure PostgreSQL is running locally and configure the connection in `.env`:

```
POSTGRES_USER=analytics
POSTGRES_PASSWORD=analytics_dev
POSTGRES_DB=analytics
POSTGRES_HOST=localhost
```

**Run migrations:**

```bash
npx prisma migrate deploy
```

**Generate Prisma client:**

```bash
npx prisma generate
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
npm start
```

## Docker

### Prerequisites

- Docker
- Docker Compose

### Development with Docker

For local development with hot reload:

```bash
cp .env.example .env
docker-compose -f docker-compose.dev.yaml up
```

This mounts your local files and enables hot reload, so changes are reflected immediately.

### Production with Docker

For production builds:

1. Create your environment file:

```bash
cp .env.example .env
```

2. Build and start the container:

```bash
docker-compose up --build
```

3. Access the application at [http://localhost:3000](http://localhost:3000)

### Running in detached mode

```bash
docker-compose up -d --build
```

### Stopping the container

```bash
docker-compose down
```

### Viewing logs

```bash
docker-compose logs -f ppc-ui
```

### Production Deployment

```powershell
# Windows
./bin/deploy.ps1

# Unix/Linux
./bin/deploy.sh
```

## Testing

This project uses Playwright for end-to-end testing.

### Run tests

```bash
npm test
```

### Run tests with UI

```bash
npm run test:ui
```

### Run tests in headed mode

```bash
npm run test:headed
```

### Debug tests

```bash
npm run test:debug
```

### Coverage report

```bash
npm run test:coverage
```

Coverage reports are generated using `monocart-reporter` and output to the `coverage/` directory.

### CI/CD

Linting and tests run automatically on pull requests via GitHub Actions. Coverage reports are uploaded as artifacts.

## Analytics Dashboard

The application includes a built-in analytics system to track page views.

### Accessing the Dashboard

Navigate to `/analytics` (e.g., `http://localhost:3000/en/analytics`).

The dashboard is protected with HTTP Basic Authentication. Configure credentials in your `.env`:

```
ANALYTICS_USER=admin
ANALYTICS_PASSWORD=your_secure_password
```

### Features

- Total page views and unique sessions
- Views over time (line chart)
- Top pages breakdown
- Top referrers
- Browser distribution
- Date range filtering

### How It Works

1. A tracking component automatically records page views via `/api/track`
2. Data is stored in PostgreSQL using Prisma ORM
3. The dashboard queries aggregated stats via `/api/analytics/stats` and `/api/analytics/views`

## Project Structure

```
src/
├── app/
│   ├── [lng]/              # Language-specific routes
│   │   ├── analytics/      # Analytics dashboard
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/                # API routes
│   │   ├── analytics/      # Analytics API endpoints
│   │   │   ├── stats/
│   │   │   └── views/
│   │   └── track/          # Page view tracking
│   ├── components/         # React components
│   │   └── Analytics.tsx   # Tracking component
│   ├── i18n/               # Internationalization config
│   │   ├── locales/        # Translation files
│   │   ├── client.tsx
│   │   ├── index.tsx
│   │   └── settings.tsx
│   ├── services/           # API services
│   └── globals.css
├── lib/
│   ├── prisma.ts           # Prisma client singleton
│   └── auth.ts             # Basic auth helper
├── middleware.tsx          # Language detection middleware
prisma/
└── schema.prisma           # Database schema
prisma.config.ts            # Prisma configuration
e2e/                        # Playwright E2E tests
├── home.spec.ts
├── i18n.spec.ts
├── language-selector.spec.ts
├── middleware.spec.ts
└── analytics.spec.ts
public/
└── images/
bin/                        # Deploy scripts
├── deploy.ps1
└── deploy.sh
```

## License

Private
