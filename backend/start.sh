#!/bin/bash
set -e

echo "Starting Alpha Core AI Backend..."
echo "Python version: $(python --version)"
echo "Installing dependencies..."
pip install --no-cache-dir -r requirements.txt

echo "Starting Uvicorn server..."
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --timeout-keep-alive 75 --ws-max-size 16777216
