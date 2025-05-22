@echo off
set SITE=http://localhost:5173/
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --user-data-dir="%TEMP%\chrome-profile-1" "%SITE%"
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --user-data-dir="%TEMP%\chrome-profile-2" "%SITE%"
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --user-data-dir="%TEMP%\chrome-profile-3" "%SITE%"