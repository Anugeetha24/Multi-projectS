# Frontend Deployment Notes

This folder contains the Vite React frontend that is meant to be deployed on Vercel.

## Local Development

1. Install dependencies with `npm install`.
2. Create a local `.env` file with `VITE_API_URL=http://localhost:5000/api`.
3. Run `npm run dev`.

## Production

Set `VITE_API_URL` in Vercel to your deployed Render backend, for example `https://your-backend.onrender.com/api`.

The app uses Vite, React, Tailwind CSS, and the standard `dev`, `build`, and `preview` scripts in [package.json](package.json).
