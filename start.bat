@echo off
echo ========================================
echo   Zhlin Photography - Next.js 项目
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] 正在安装依赖...
call npm install

if %ERRORLEVEL% neq 0 (
    echo.
    echo 安装失败！请确保已安装 Node.js (https://nodejs.org/)
    pause
    exit /b 1
)

echo.
echo [2/2] 正在启动开发服务器...
echo.
echo 访问 http://localhost:3000 查看网站
echo 按 Ctrl+C 停止服务器
echo.

npm run dev

pause
