FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
# For a smaller image / free-tier hosting, delete the sentence-transformers line from
# requirements.txt: the service falls back to TF-IDF similarity automatically.
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
ENV PORT=8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
