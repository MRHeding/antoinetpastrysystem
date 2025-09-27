@echo off
echo Starting Tailwind CSS development build (watch mode)...
echo Press Ctrl+C to stop watching
npx tailwindcss -i ./src/input.css -o ./css/output.css --watch
