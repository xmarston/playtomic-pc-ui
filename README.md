# Playtomic PC UI

A Next.js web application for Playtomic with multi-language support.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
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

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
npm install
```

### Environment Setup

Copy the example environment file and configure as needed:

```bash
cp .env.example .env
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

## Project Structure

```
src/
├── app/
│   ├── [lng]/           # Language-specific routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/      # React components
│   ├── i18n/            # Internationalization config
│   │   ├── locales/     # Translation files
│   │   ├── client.tsx
│   │   ├── index.tsx
│   │   └── settings.tsx
│   ├── services/        # API services
│   └── globals.css
├── middleware.tsx       # Language detection middleware
e2e/                     # Playwright E2E tests
├── home.spec.ts
├── i18n.spec.ts
├── language-selector.spec.ts
└── middleware.spec.ts
public/
└── images/
bin/                     # Deploy scripts
├── deploy.ps1
└── deploy.sh
```

## License

Private
