@echo off
title Cinema Movie Demo Runner

echo Starting Docker MySQL and RabbitMQ...
cd /d E:\cinema-management-system
docker compose up -d

echo Starting Eureka Server...
start "Eureka Server" cmd /k "cd /d E:\cinema-management-system\backend\eureka-server && mvn spring-boot:run"

timeout /t 10

echo Starting API Gateway...
start "API Gateway" cmd /k "cd /d E:\cinema-management-system\backend\api-gateway && mvn spring-boot:run"

timeout /t 5

echo Starting User Service...
start "User Service" cmd /k "cd /d E:\cinema-management-system\backend\user-service && mvn spring-boot:run"

echo Starting Movie Service...
start "Movie Service" cmd /k "cd /d E:\cinema-management-system\backend\movie-service && mvn spring-boot:run"

echo.
echo Backend movie demo is starting...
echo Open Eureka Dashboard: http://localhost:8761
echo Open API Gateway movies: http://localhost:8080/api/movies
echo.
pause