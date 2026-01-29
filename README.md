
# Market Analyst AI

An autonomous multi-agent research system powered by Google Gemini. Enter a market or topic to generate comprehensive research reports with real-time web data.

## Features

- **4-Stage Research Pipeline**: Strategist → Researcher → Analyst → Synthesizer
- **Real-Time Updates**: Server-Sent Events (SSE) for live progress tracking
- **Real Web Search**: Brave Search API integration with caching and rate limiting
- **Professional Reports**: Structured JSON metadata + Markdown format with downloadable output

## Documentation

> 📚 **[View Full Documentation](./docs/1.%20Project%20Overview.md)** - Detailed architecture, workflow, and API reference.

## Architecture

```
┌─────────────┐    SSE Stream    ┌─────────────────┐
│   Next.js   │◄────────────────►│    FastAPI      │
│   Frontend  │    POST /research│    Backend      │
└─────────────┘                  └────────┬────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
              ┌─────▼─────┐        ┌──────▼──────┐       ┌──────▼──────┐
              │  Gemini   │        │ Brave Search │       │   Config    │
              │   API     │        │     API      │       │  Manager    │
              └───────────┘        └──────────────┘       └─────────────┘
```

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- Google Gemini API key
- Brave Search API key (optional, falls back to mock data)

### 1. Clone & Setup

```bash
cd google-adk-agent
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your API keys
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (optional)
cp .env.local.example .env.local
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
python simple_agent.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:3000 in your browser.

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Copy environment template
cp .env.example .env
# Edit .env and add your API keys

# Build and run
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Building Individual Images

```bash
# Backend
cd backend
docker build -t market-analyst-backend .

# Frontend
cd frontend
docker build -t market-analyst-frontend \
  --build-arg NEXT_PUBLIC_BACKEND_URL=http://your-backend-url:8000 .
```

## Running Tests

### Backend Tests

```bash
cd backend
pip install -r requirements.txt
pytest tests/ -v --cov=.
```

### Frontend Type Check

```bash
cd frontend
npm run build  # Includes type checking
```

## Configuration

### Backend Environment Variables (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_API_KEY` | Yes | - | Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-2.0-flash` | Gemini model to use |
| `PORT` | No | `8000` | Backend server port |
| `BRAVE_SEARCH_API_KEY` | No | - | Brave Search API key (for real web search) |
| `ALLOWED_ORIGINS` | No | `http://localhost:3000` | CORS allowed origins |
| `ENVIRONMENT` | No | `development` | Environment mode |
| `LOG_LEVEL` | No | `INFO` | Logging verbosity |

### Frontend Environment Variables (.env.local)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | No | `http://localhost:8000` | Backend API URL |

## API Reference

### `POST /research`

Start a market research session. Returns an SSE stream with real-time updates.

**Request:**
```json
{
  "topic": "Electric vehicles market in Europe 2024"
}
```

**SSE Events:**
- `state`: Progress updates with logs, current step, and partial results
- `complete`: Final report when research is done
- `error`: Error information if something fails

### `GET /health`

Health check endpoint for readiness probes.

**Response:**
```json
{
  "status": "healthy",
  "service": "Market Analyst Agent",
  "environment": "development",
  "model": "gemini-2.0-flash"
}
```

### `GET /health/live`

Liveness probe for Kubernetes deployments.

### `GET /metrics`

Prometheus-style metrics for monitoring.

**Response:**
```json
{
  "service": "market_analyst_agent",
  "metrics": {
    "requests_total": 100,
    "requests_success": 95,
    "requests_error": 5,
    "research_sessions": 50
  }
}
```

## Project Structure

```
google-adk-agent/
├── backend/
│   ├── simple_agent.py     # Main FastAPI server
│   ├── llm_client.py       # Gemini API client
│   ├── config.py           # Configuration management
│   ├── tools/
│   │   ├── search.py       # Brave Search integration
│   │   └── fetch.py        # Document fetcher
│   ├── tests/              # Pytest test suite
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Main page
│   │   │   ├── layout.tsx      # Root layout
│   │   │   └── globals.css     # Global styles
│   │   ├── components/
│   │   │   ├── ResearchDashboard.tsx
│   │   │   ├── ResearchInput.tsx
│   │   │   ├── ReportViewer.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── hooks/
│   │   │   └── useResearch.ts  # SSE client hook
│   │   └── types/
│   │       └── research.ts     # TypeScript types
│   ├── Dockerfile
│   ├── package.json
│   └── .env.local.example
│
├── .github/
│   └── workflows/
│       └── ci.yml          # CI/CD pipeline
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## Research Pipeline

1. **Strategist**: Analyzes the topic and creates a research plan with key questions
2. **Researcher**: Performs real web searches using Brave Search API, collects data
3. **Analyst**: Processes findings, extracts trends, metrics, and insights
4. **Synthesizer**: Creates a professional report with JSON metadata and structured sections

## Security

- API keys are loaded from environment variables (not hardcoded)
- CORS is restricted to specific origins and methods
- Input validation on all endpoints
- URL validation before fetching external content

## Troubleshooting

### "GOOGLE_API_KEY is not set"
Copy `.env.example` to `.env` and add your Google API key.

### "Model not found" error
Ensure `GEMINI_MODEL` is set to a valid model like `gemini-2.0-flash`.

### Search returns mock data
Set `BRAVE_SEARCH_API_KEY` in `.env` for real web search results.

### CORS errors
Ensure `ALLOWED_ORIGINS` includes your frontend URL.

## License

MIT

---

*Powered by Google Gemini and Brave Search*

