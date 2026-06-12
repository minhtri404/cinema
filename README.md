# Cinema Management System

## Requirements

- Java 21
- Docker Desktop
- Git

## Start Docker

```powershell
docker compose up -d
```

## Docker Services

MySQL:

- Host: localhost
- Port: 3307
- Username: root
- Password: 123456

Databases:

- movie_db
- showtime_db
- booking_db

RabbitMQ:

- App port: 5672
- Dashboard: http://localhost:15672
- Username: admin
- Password: 123456

## Run Backend Services

Run Eureka first:

```powershell
cd backend\eureka-server
.\mvnw.cmd spring-boot:run
```

Run Movie Service:

```powershell
cd backend\movie-service
.\mvnw.cmd spring-boot:run
```

Run Showtime Service:

```powershell
cd backend\showtime-service
.\mvnw.cmd spring-boot:run
```

Run Booking Service:

```powershell
cd backend\booking-service
.\mvnw.cmd spring-boot:run
```

Run API Gateway:

```powershell
cd backend\api-gateway
.\mvnw.cmd spring-boot:run
```

## URLs

- Eureka: http://localhost:8761
- API Gateway: http://localhost:8080
- Movie API: http://localhost:8080/api/movies
- Showtime API: http://localhost:8080/api/showtimes
- Booking API: http://localhost:8080/api/bookings
