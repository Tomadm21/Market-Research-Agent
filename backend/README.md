# Market Analyst Agent - Backend

Production-ready backend for the Google ADK Multi-Agent Market Research System.

## Features

- ✅ **Secure Configuration**: Environment-based secrets, no hardcoded API keys
- ✅ **Gemini AI Integration**: Latest Google Gemini SDK for LLM capabilities
- ✅ **Real-Time Updates**: Server-Sent Events (SSE) for live progress streaming
- ✅ **4-Stage Research Pipeline**:
  1. Strategist: Breaks down research topics
  2. Researcher: Collects market data
  3. Analyst: Extracts insights and trends
  4. Synthesizer: Generates professional reports
- ✅ **REST API**: Simple, standard HTTP endpoints
- ✅ **Health Checks**: `/health` endpoint for monitoring
- ✅ **CORS Security**: Restricted origins, methods, and headers
- ✅ **Input Validation**: Prevents injection attacks
- ✅ **Error Handling**: Comprehensive try-catch blocks
- ✅ **Python 3.9+ Compatible**: No advanced type syntax dependencies

## Quick Start

### 1. Set up environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Google API key
# GOOGLE_API_KEY=your_actual_key_here
```

### 2. Install dependencies

```bash
pip3 install -r requirements.txt
```

### 3. Run the server

```bash
python3 simple_agent.py
```

Or use the convenience script from the root directory:

```bash
./run_backend.sh
```

The server will start on `http://localhost:8000` (or the port specified in `.env`).

## API Endpoints

### POST /research

Start market research on a topic. Returns SSE stream with real-time updates.

**Request:**
```json
{
  "topic": "electric vehicles market 2024"
}
```

**Response:** Server-Sent Events stream

Events sent:
- `state`: Progress updates with current step and logs
- `complete`: Final report when research finishes
- `error`: Error information if something fails

**Example with curl:**
```bash
curl -X POST http://localhost:8000/research \
  -H "Content-Type: application/json" \
  -d '{"topic": "AI market trends"}' \
  --no-buffer
```

### GET /health

Health check endpoint. Returns service status and configuration.

**Response:**
```json
{
  "status": "healthy",
  "service": "Market Analyst Agent",
  "environment": "development",
  "model": "gemini-2.0-flash-exp"
}
```

### GET /

Root endpoint with API documentation.

## Architecture

```
simple_agent.py          # Main FastAPI application
├── ResearchRequest      # Pydantic model for validation
├── AgentState          # State management during research
├── perform_market_research_stream()  # Async SSE generator
└── API endpoints

llm_client.py           # Gemini API client wrapper
config.py               # Centralized configuration
agents/                 # Agent definitions (legacy, not used)
```

## Configuration

All configuration is in `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_API_KEY` | Google Gemini API key (required) | - |
| `PORT` | Server port | 8000 |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | http://localhost:3000 |
| `ENVIRONMENT` | Environment name | development |
| `GEMINI_MODEL` | Gemini model to use | gemini-2.0-flash-exp |
| `BRAVE_SEARCH_API_KEY` | Brave Search API key (Phase 3) | - |
| `LOG_LEVEL` | Logging level | INFO |

## Security

✅ **No secrets in code** - all configuration via environment variables
✅ **CORS restrictions** - only specific origins, methods, headers allowed
✅ **Input validation** - topic length limits, sanitization
✅ **Error handling** - no stack traces leaked to clients
✅ **Health checks** - monitoring endpoints for production

## Development

### Running in development mode

```bash
# With auto-reload
uvicorn simple_agent:app --reload --port 8000
```

### Testing the API

```bash
# Health check
curl http://localhost:8000/health

# Start research (will stream responses)
curl -X POST http://localhost:8000/research \
  -H "Content-Type: application/json" \
  -d '{"topic": "renewable energy market"}' \
  --no-buffer
```

### Adding new features

1. Update `simple_agent.py` for API changes
2. Update `llm_client.py` for LLM integration changes
3. Update `config.py` for new configuration options
4. Update `.env.example` to document new variables

## Troubleshooting

### "GOOGLE_API_KEY is not set"

- Check that `.env` file exists in the backend directory
- Verify the API key is set: `GOOGLE_API_KEY=your_key_here`
- Ensure no quotes or extra spaces around the key

### "Configuration validation failed"

- Run `python3 config.py` to see specific errors
- Check all required variables are set in `.env`
- Verify the `.env` file is in the correct directory

### Import errors

- Ensure all dependencies are installed: `pip3 install -r requirements.txt`
- Check Python version: `python3 --version` (should be 3.9+)
- Try: `pip3 install --upgrade google-genai`

### Server won't start

- Check if port 8000 is already in use: `lsof -i :8000`
- Try a different port: `PORT=8001 python3 simple_agent.py`
- Check logs for specific error messages

## Production Deployment

For production deployment:

1. Set `ENVIRONMENT=production` in `.env`
2. Use a production ASGI server (already using uvicorn)
3. Set up reverse proxy (nginx/Apache) for HTTPS
4. Configure proper CORS origins for your domain
5. Set up monitoring and logging
6. Use secrets manager instead of `.env` file
7. Set up health check monitoring

## Next Steps (Phase 3+)

- [ ] Integrate real Brave Search API instead of mock data
- [ ] Add request rate limiting
- [ ] Implement caching layer (Redis)
- [ ] Add user authentication
- [ ] Set up background job processing
- [ ] Add comprehensive test suite
- [ ] Set up CI/CD pipeline
- [ ] Add structured logging with JSON format

## License

Part of Google ADK Multi-Agent System project.
