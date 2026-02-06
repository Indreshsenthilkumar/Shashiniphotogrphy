@echo off
echo ========================================================
echo  SHASHINI STUDIO - AUTO GITHUB SYNC
echo ========================================================
echo.
echo [1/3] Adding all changes...
git add .

echo [2/3] Committing changes...
set /p msg="Enter commit message (Press Enter for 'Update'): "
if "%msg%"=="" set msg=Update
git commit -m "%msg%"

echo [3/3] Pushing to GitHub...
echo.
echo NOTE: If a window pops up, please sign in to GitHub.
echo.
git push -u origin main

echo.
if %errorlevel% neq 0 (
    echo [ERROR] Push failed. Please check your internet or login.
    pause
    exit /b %errorlevel%
)

echo [SUCCESS] Code pushed to GitHub successfully!
echo.
pause
