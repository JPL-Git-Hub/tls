#!/bin/bash

echo "🧹 Cleaning development processes..."
# Kill npm/node processes silently
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true

echo "🔧 Killing ngrok processes..."
# Kill ngrok processes silently and wait for cleanup
pkill -f "ngrok" 2>/dev/null || true
sleep 2

echo "🗑️  Clearing Next.js cache..."
# Remove Next.js cache directory
rm -rf .next 2>/dev/null || true

echo "🔥 Starting Firebase emulators..."
# Start Firebase emulators in background
firebase emulators:start &
EMULATOR_PID=$!

echo "⏳ Waiting for emulators to initialize..."
sleep 5

echo "🚀 Starting development server with emulators..."
# Set USE_EMULATOR environment variable and start development
USE_EMULATOR=true npm run dev

# Cleanup function
cleanup() {
  echo "🛑 Shutting down..."
  kill $EMULATOR_PID 2>/dev/null || true
  pkill -f "firebase emulators" 2>/dev/null || true
  exit 0
}

# Trap cleanup on script exit
trap cleanup EXIT INT TERM