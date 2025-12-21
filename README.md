# Playtomic PC UI

A Next.js web application for Playtomic with multi-language support.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **i18n**: react-i18next with support for 7 languages

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

### Running with Docker Compose

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
./bin/deploy.ps1
```

## Project Structure

```
src/
├── app/
│   ├── [lng]/           # Language-specific routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── i18n/            # Internationalization config
│   │   ├── locales/     # Translation files
│   │   ├── client.tsx
│   │   ├── index.tsx
│   │   └── settings.tsx
│   ├── services/        # API services
│   └── globals.css
├── middleware.tsx       # Language detection middleware
public/
└── images/
```

## License

Private
