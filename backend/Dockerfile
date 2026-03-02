FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set Python path
ENV PYTHONPATH=/app

# Expose port
EXPOSE 8080

# Run database migrations (continue on error if tables exist) and start server
CMD (alembic upgrade head || true) && uvicorn app.main:app --host 0.0.0.0 --port 8080
