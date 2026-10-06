# Deployment (free tier friendly)

Deploy in this order, because each service needs the URL of the previous one.

1. **MongoDB Atlas** - create a free cluster, a database user, allow network access
   (0.0.0.0/0 for demos), copy the connection string -> `MONGO_URI`.
2. **AI service on Render** (Web Service, Docker or Python)
   - Root directory `ai-service`; build `pip install -r requirements.txt`; start
     `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
   - Free instances have ~512 MB RAM: remove `sentence-transformers` from requirements.txt and set
     `FORCE_TFIDF=1`. Optional: `ANTHROPIC_API_KEY` for LLM interview feedback.
   - Check `https://<ai>.onrender.com/health`.
3. **Backend on Render/Railway** (root `server`, build `npm install`, start `npm start`)
   - Env: `MONGO_URI`, `JWT_SECRET` (long random), `AI_SERVICE_URL=https://<ai>.onrender.com`,
     `CLIENT_URL=https://<your-app>.vercel.app`.
   - Run the seed once from a Render shell (`npm run seed`) or create the admin manually.
4. **Frontend on Vercel** (root `client`, framework Vite)
   - Env: `VITE_API_URL=https://<server>.onrender.com/api`. `vercel.json` already handles SPA routing.
5. Test: open the site, log in as admin, check `/api/health` shows `ai.up: true`.

Notes: free Render services sleep after inactivity, so the first request can take ~30-60 s.
`npm run seed` deletes existing data; do not run it on a database with real records.
