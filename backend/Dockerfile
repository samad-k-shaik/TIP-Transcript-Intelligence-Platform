FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code into a subdirectory to match the import structure
COPY . ./backend

# Set PYTHONPATH so the 'backend' package is discoverable
ENV PYTHONPATH=/app

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
