FROM python:3.11-slim
WORKDIR /app

COPY agents/requirements.txt agents/requirements.txt
RUN pip install --no-cache-dir -r agents/requirements.txt

COPY agents agents
COPY api api

ENV PORT=8080
ENV PYTHONPATH=/app/agents
CMD ["sh", "-c", "uvicorn api.main:app --host 0.0.0.0 --port ${PORT}"]