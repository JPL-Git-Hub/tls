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

echo "🚀 Starting fresh development server..."
# Start npm run dev (this will also start ngrok via concurrently)
npm run dev