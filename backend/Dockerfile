# SubSense API — container image.
#
# subsense.db and ml/model.pkl are generated artifacts (gitignored), so the
# image builds them at build time: the container boots ready to serve.
#
# Build from the repo root:  docker build -f backend/Dockerfile -t subsense-api .
FROM python:3.12-slim

WORKDIR /app

# libgomp1 is required by the XGBoost / LightGBM runtime.
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Build the demo database and train the churn model (bakes subsense.db + ml/model.pkl).
RUN python -m backend.init_db \
    && python -m ml.seed_data \
    && python -m ml.features \
    && python -m ml.train \
    && python -m ml.health

EXPOSE 8000
# Render / Railway inject $PORT; fall back to 8000 for local runs.
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
