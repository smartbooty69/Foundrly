@echo off
echo 🤖 Testing AI Services Setup...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo ❌ .env.local file not found
    echo Please create .env.local with your AI API keys
    echo.
    echo Required variables:
    echo GEMINI_API_KEY=your_gemini_api_key
    echo ANTHROPIC_API_KEY=your_anthropic_api_key
    echo PINECONE_API_KEY=your_pinecone_api_key
    pause
    exit /b 1
)

REM Run the test script
echo Running AI setup test...
node scripts/test-ai-setup.js

if %errorlevel% equ 0 (
    echo.
    echo ✅ AI setup test completed successfully!
    echo.
    echo Next steps:
    echo 1. Visit http://localhost:3000/ai-features to test AI components
    echo 2. Create a Pinecone index named "foundrly-startups"
    echo 3. Sync your existing startups using the sync API
) else (
    echo.
    echo ❌ AI setup test failed
    echo Please check the error messages above and fix any issues
)

echo.
pause

