#!/bin/bash
# One-command deployment (run after: vercel login)

echo "🚀 Deploying Dinner Planner..."

# Backend
cd backend
echo "📦 Backend deploying..."
vercel --prod --yes
cd ..

# Frontend  
cd frontend
echo "📦 Frontend deploying..."
vercel --prod --yes
cd ..

# Admin
cd admin
echo "📦 Admin deploying..."
vercel --prod --yes
cd ..

echo "✅ ALL DEPLOYED! Check Vercel dashboard for URLs"
