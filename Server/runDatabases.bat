@echo off
docker run --name redis -d -p 6379:6379 redis
docker run --name mongo -d -p 27017:27017 mongo
pause
