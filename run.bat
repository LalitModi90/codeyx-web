@echo off
echo Starting Codeyx Backend...
start cmd.exe /k "cd /d f:\Codeyx\backend && npm run dev"

echo Starting Codeyx Frontend...
start cmd.exe /k "cd /d f:\Codeyx\frontend && npm run dev"

echo Both servers are starting up in separate windows!
