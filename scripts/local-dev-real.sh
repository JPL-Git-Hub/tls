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

echo "🔥 Killing Firebase emulator processes..."
# Kill Firebase emulator processes silently
pkill -f "firebase emulators" 2>/dev/null || true

echo "🗑️  Clearing Next.js cache..."
# Remove Next.js cache directory
rm -rf .next 2>/dev/null || true

echo "🚀 Starting fresh development server..."
# Set NODE_ENV=development and start npm run dev (this will also start ngrok via concurrently)
NODE_ENV=development npm run dev