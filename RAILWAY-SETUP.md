# Railway Environment Variables Setup

## Required Environment Variables for Railway

Add these in your Railway project settings under "Variables":

### Core API Keys
```
GOOGLE_API_KEY=your_gemini_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### Optional Alternative APIs
```
# OpenRouter (if you want fallback)
OPENROUTER_API_KEY=your_openrouter_api_key_here
STRATEGY_OPENROUTER_API_KEY=your_openrouter_api_key_here
ML_OPENROUTER_API_KEY=your_openrouter_api_key_here

# OpenAI (if you want fallback)
OPENAI_API_KEY=your_openai_api_key_here
STRATEGY_OPENAI_API_KEY=your_openai_api_key_here
ML_OPENAI_API_KEY=your_openai_api_key_here
```

### Model Configuration
```
# OpenRouter Models
STRATEGY_OPENROUTER_MODEL=openai/gpt-4o-mini
ML_OPENROUTER_MODEL=openai/gpt-4o-mini

# OpenAI Models
STRATEGY_OPENAI_MODEL=gpt-4o-mini
ML_OPENAI_MODEL=gpt-4o-mini
```

### Storage Configuration
```
STORAGE_DIR=./data/temp
```

## Railway Deployment Steps

1. **Push your code to GitHub** (Railway is already connected)

2. **Set Environment Variables** in Railway dashboard:
   - Go to your project → Settings → Variables
   - Add all the variables above

3. **Configure Railway Settings**:
   - Railway will use `railway.json` from the repo root
   - Build command: `pip install -r server/requirements.txt`
   - Start command: `cd server && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Healthcheck Path: `/health`

4. **Deploy**:
   - Railway will auto-deploy when you push to main branch
   - Or trigger manual deploy from Railway dashboard

## Frontend Deployment (Vercel)

Your frontend should be deployed on Vercel.

Update the frontend API URL to point to your Railway backend:
- In client code, change API calls from `localhost:8000` to your Railway URL
- Railway will provide a URL like: `your-app-name.up.railway.app`

## Production Considerations

1. **Domain**: Add custom domain in Railway settings
2. **Monitoring**: Enable Railway logs and metrics
3. **Scaling**: Configure auto-scaling based on traffic
4. **Security**: Enable Railway's built-in security features
