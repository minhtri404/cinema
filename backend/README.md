# Backend Setup

Backend uses Spring Boot microservices with Eureka, API Gateway, MySQL, and RabbitMQ.

## Requirements

- Java 21
- Maven or project Maven wrapper
- Docker Desktop

## Run Docker SQL and RabbitMQ

From the project root:

```powershell
cd E:\cinema-management-system
docker compose up -d mysql rabbitmq
```

MySQL connection:

- Host: `localhost`
- Port: `3307`
- Username: `root`
- Password: `123456`
- Container: `cinema-mysql`

RabbitMQ dashboard:

- URL: `http://localhost:15672`
- Username: `admin`
- Password: `123456`

## SQL Init Files

Docker loads SQL files from:

```text
docker/mysql/init/
```

Current files:

- `01-create-databases.sql`: creates service databases.
- `02-create-tables.sql`: creates movie/user tables and sample data.

Important: MySQL only runs files in `/docker-entrypoint-initdb.d` when the database volume is created for the first time.

## Reset MySQL and Run SQL Init Again

Use this when you want Docker to recreate the database and re-run all SQL init files:

```powershell
docker compose down -v
docker compose up -d mysql rabbitmq
```

This deletes the Docker volume `mysql_data`, so local database data will be removed.

## Import SQL Manually

If MySQL is already running and you only want to import/update SQL without deleting the volume:

PowerShell:

```powershell
Get-Content .\docker\mysql\init\02-create-tables.sql | docker exec -i cinema-mysql mysql -uroot -p123456
```

CMD:

```bat
docker exec -i cinema-mysql mysql -uroot -p123456 < docker\mysql\init\02-create-tables.sql
```

Check data:

```powershell
docker exec -it cinema-mysql mysql -uroot -p123456
```

Inside MySQL:

```sql
USE movie_db;
SELECT * FROM movies;
```

## Run Backend Services With Docker Compose

Run all backend infrastructure and services:

```powershell
docker compose up -d
```

Useful URLs:

- Eureka: `http://localhost:8761`
- API Gateway: `http://localhost:8080`
- Movie API: `http://localhost:8080/api/movies`
- User API: `http://localhost:8080/api/users`

## Run Backend Services Manually

Start Docker SQL/RabbitMQ first:

```powershell
docker compose up -d mysql rabbitmq
```

Then run services in this order:

```powershell
cd backend\eureka-server
mvn spring-boot:run
```

```powershell
cd backend\api-gateway
mvn spring-boot:run
```

```powershell
cd backend\movie-service
mvn spring-boot:run
```

```powershell
cd backend\user-service
mvn spring-boot:run
```

```powershell
cd backend\showtime-service
mvn spring-boot:run
```

```powershell
cd backend\booking-service
mvn spring-boot:run
```
