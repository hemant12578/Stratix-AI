# Stratix AI - Docker Deployment

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- `.env` file configured in project root

### Running the Application

1. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Or run in detached mode:**
   ```bash
   docker-compose up --build -d
   ```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Health Check**: http://localhost:8000/health

### Environment Configuration
Make sure your `.env` file contains all required API keys:
```env
# Google Gemini API
GOOGLE_API_KEY=your_gemini_api_key

# OpenRouter API (optional)
OPENROUTER_API_KEY=your_openrouter_api_key

# OpenAI API (optional)
OPENAI_API_KEY=your_openai_api_key
```

### Development Mode
For development with hot reload:
```bash
# Backend only
docker-compose up backend --build

# Frontend only (requires backend running)
cd client && npm run dev
```

### Production Deployment
For production deployment:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

### Stopping Services
```bash
docker-compose down
```

### Viewing Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Docker Volumes
- `./server/data:/app/data` - Persistent storage for processed datasets

### Health Checks
Both services include health checks:
- Backend: `/health` endpoint
- Frontend: Nginx status

### Troubleshooting
1. **Port conflicts**: Change ports in `docker-compose.yml`
2. **Permission issues**: Ensure `.env` file is readable
3. **Build failures**: Check `requirements.txt` and `package.json` dependencies
