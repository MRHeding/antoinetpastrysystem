@echo off
echo Building Tailwind CSS for Antonette's Pastries...
npx tailwindcss -i ./src/input.css -o ./css/output.css --minify
echo Build complete! CSS file updated at ./css/output.css
pause
