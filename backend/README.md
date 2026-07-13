# Huong Dan Chay Backend

Backend duoc tach theo mo hinh microservice, gom Eureka Server, API Gateway, MySQL va RabbitMQ.

## Yeu cau

- Java 21
- Maven hoac Maven wrapper cua tung service
- Docker Desktop

## Chay Docker SQL va RabbitMQ

Mo terminal tai thu muc goc project:

```powershell
cd E:\cinema-management-system
docker compose up -d mysql rabbitmq
```

Thong tin ket noi MySQL:

- Host: `localhost`
- Port: `3307`
- User: `root`
- Password: `demo_password_change_me`
- Container: `cinema-mysql`

RabbitMQ dashboard:

- URL: `http://localhost:15672`
- User: `admin`
- Password: `demo_password_change_me`

## File SQL khoi tao du lieu

Docker se tu dong chay cac file SQL trong thu muc:

```text
docker/mysql/init/
```

Cac file hien co:

- `01-create-databases.sql`: tao database cho cac service.
- `02-create-tables.sql`: tao bang movies, genres, theaters, users va them du lieu mau.

Anh poster mau duoc luu trong:

```text
backend/movie-service/uploads/movies/
```

Khi clone repo va chay Docker, movie-service mount thu muc `backend/movie-service` vao container nen cac anh nay co san trong container.

Luu y: MySQL chi tu dong chay cac file SQL trong `/docker-entrypoint-initdb.d` o lan tao volume dau tien. Neu volume da ton tai, sua file SQL se khong tu dong chay lai.

## Reset MySQL de chay lai SQL tu dau

Dung cach nay khi muon xoa database cu va de Docker chay lai toan bo file SQL init:

```powershell
docker compose down -v
docker compose up -d mysql rabbitmq
```

Lenh `docker compose down -v` se xoa volume `mysql_data`, nen du lieu local trong MySQL se mat.

## Import SQL thu cong

Dung cach nay khi MySQL dang chay va ban chi muon nap lai file SQL ma khong xoa volume.

PowerShell:

```powershell
Get-Content .\docker\mysql\init\02-create-tables.sql | docker exec -i cinema-mysql mysql -uroot -pdemo_password_change_me
```

CMD:

```bat
docker exec -i cinema-mysql mysql -uroot -pdemo_password_change_me < docker\mysql\init\02-create-tables.sql
```

Kiem tra du lieu sau khi import:

```powershell
docker exec -it cinema-mysql mysql -uroot -pdemo_password_change_me
```

Trong MySQL:

```sql
USE movie_db;
SELECT * FROM movies;
```

## Chay toan bo backend bang Docker Compose

Tai thu muc goc project:

```powershell
docker compose up -d
```

Cac URL quan trong:

- Eureka: `http://localhost:8761`
- API Gateway: `http://localhost:8080`
- Movie API: `http://localhost:8080/api/movies`
- Genre API: `http://localhost:8080/api/genres`
- Theater API: `http://localhost:8080/api/theaters`
- Showtime API: `http://localhost:8080/api/showtimes`
- Booking API: `http://localhost:8080/api/bookings`
- User API: `http://localhost:8080/api/users`

## Du lieu mau da co

- 3 phim mau, co poster va trailer YouTube.
- 10 the loai phim trong bang `movie_db.genres`.
- 7 rap mau trong bang `showtime_db.theaters`.
- 1 tai khoan admin trong bang `user_db.users`.

## Chay backend thu cong

Chay MySQL va RabbitMQ truoc:

```powershell
docker compose up -d mysql rabbitmq
```

Sau do chay cac service theo thu tu sau.

Eureka Server:

```powershell
cd backend\eureka-server
mvn spring-boot:run
```

API Gateway:

```powershell
cd backend\api-gateway
mvn spring-boot:run
```

Movie Service:

```powershell
cd backend\movie-service
mvn spring-boot:run
```

User Service:

```powershell
cd backend\user-service
mvn spring-boot:run
```

Showtime Service:

```powershell
cd backend\showtime-service
mvn spring-boot:run
```

Booking Service:

```powershell
cd backend\booking-service
mvn spring-boot:run
```

## Tai khoan demo

Neu da import `02-create-tables.sql`, co the dang nhap frontend bang:

- Email: `admin@example.invalid`
- Password: `demo_password_change_me`

## Docker, Actuator va Circuit Breaker

Luu y: Dockerfile hien copy file `.jar` tu thu muc `target/` cua tung service de tranh loi Maven download dependency trong Docker build. Neu sua code Java, build jar truoc:

```powershell
mvn -q -DskipTests package
```

Chay toan bo backend tu thu muc `backend`:

```powershell
docker compose up --build
```

Compose hien chay 7 container:

- `cinema-mysql`
- `cinema-eureka-server`
- `cinema-api-gateway`
- `cinema-movie-service`
- `cinema-showtime-service`
- `cinema-booking-service`
- `cinema-user-service`

Database dung Docker volume `mysql_data`:

```yaml
volumes:
  mysql_data:
```

Kiem tra Actuator:

```powershell
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/metrics
curl http://localhost:8083/actuator/health
curl http://localhost:8083/actuator/metrics
```

Circuit Breaker duoc dat trong `booking-service`. Trong project cinema, `booking-service` dong vai tro Order Service va `movie-service` dong vai tro Product Service.

Khi `movie-service` dang chay:

```powershell
curl http://localhost:8080/api/bookings/product/1
```

Ket qua mong doi: tra ve thong tin phim tu `movie-service`.

Dung Product/Movie Service:

```powershell
docker compose stop movie-service
curl http://localhost:8080/api/bookings/product/1
```

Ket qua mong doi: `booking-service` khong bi loi 500, Circuit Breaker tra fallback:

```json
{
  "id": 1,
  "available": false,
  "fallback": true,
  "message": "Product/Movie Service is unavailable. Booking Service fallback response was returned.",
  "error": "ResourceAccessException"
}
```

Bat lai service:

```powershell
docker compose start movie-service
```


