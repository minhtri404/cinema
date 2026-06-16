# Cinema Management System

He thong quan ly rap phim gom frontend React va backend Spring Boot microservices. Du an dang chay theo mo hinh Eureka Server, API Gateway, MySQL, RabbitMQ va cac service rieng cho phim, lich chieu, dat ve, nguoi dung.

## Da cap nhat

- Sap xep lai frontend theo cau truc `app`, `api`, `layouts`, `pages`, `styles`, `utils`.
- Them giao dien admin cho phim, the loai, rap va cac form tao/sua.
- Sua nut them phim, sua phim va loi layout bi long layout.
- Them upload poster phim, luu anh trong `backend/movie-service/uploads/movies`.
- Them trailer YouTube cho phim, ho tro nhap link YouTube hoac ma video va hien preview trong form them/sua phim.
- Them bang `genres` va API `/api/genres`.
- Them bang `theaters` va API `/api/theaters`.
- Cap nhat API Gateway route cho `/api/movies/**`, `/api/genres/**`, `/api/showtimes/**`, `/api/theaters/**`, `/api/bookings/**`, `/api/auth/**`, `/api/users/**`.
- Cap nhat seed SQL co phim mau, 10 the loai, 7 rap mau va tai khoan admin.
- Them proxy Vite cho `/api` va `/api/uploads`.

## Yeu cau

- Java 21
- Node.js va npm
- Docker Desktop
- Git

## Chay bang Docker

Tai thu muc goc project:

```powershell
cd E:\cinema-management-system
docker compose up -d
```

Docker se chay:

- MySQL: `localhost:3307`, user `root`, password `123456`
- RabbitMQ dashboard: `http://localhost:15672`, user `admin`, password `123456`
- Eureka: `http://localhost:8761`
- API Gateway: `http://localhost:8080`
- Movie Service: `http://localhost:8081`
- Showtime Service: `http://localhost:8082`
- Booking Service: `http://localhost:8083`
- User Service: `http://localhost:8084`

## Chay frontend

```powershell
cd frontend\cinema-react
npm install
npm run dev
```

Mo URL Vite hien trong terminal, thuong la:

```text
http://localhost:5173
```

Neu port `5173` ban, Vite se tu chuyen sang `5174`, `5175`...

## Tai khoan demo

```text
Email: admin@gmail.com
Password: 123456
```

## API chinh

- Dang nhap: `POST http://localhost:8080/api/auth/login`
- Danh sach phim: `GET http://localhost:8080/api/movies`
- Them phim: `POST http://localhost:8080/api/movies`
- The loai: `GET/POST http://localhost:8080/api/genres`
- Lich chieu: `GET/POST http://localhost:8080/api/showtimes`
- Rap: `GET/POST http://localhost:8080/api/theaters`
- Dat ve: `GET/POST http://localhost:8080/api/bookings`
- Nguoi dung: `GET http://localhost:8080/api/users`

Co the goi truc tiep service khi can debug:

- Movie: `http://localhost:8081/api/movies`
- Showtime: `http://localhost:8082/api/showtimes`
- Theater: `http://localhost:8082/api/theaters`

## Du lieu mau

File init SQL nam tai:

```text
docker/mysql/init/02-create-tables.sql
```

File nay tao:

- `movie_db.movies`
- `movie_db.genres`
- `showtime_db.theaters`
- `user_db.users`

Luu y: MySQL chi tu chay file init khi volume duoc tao lan dau. Neu da chay Docker truoc do va muon nap lai du lieu mau:

```powershell
docker compose down -v
docker compose up -d
```

Lenh tren se xoa database local trong Docker volume.

## Anh poster

Anh upload duoc luu trong:

```text
backend/movie-service/uploads/movies
```

Thu muc nay duoc mount vao container `movie-service`, nen khi clone repo va chay Docker se co san anh mau neu file anh da duoc commit len GitHub.

## Build kiem tra

Frontend:

```powershell
cd frontend\cinema-react
npm run build
```

Backend movie-service:

```powershell
cd backend\movie-service
.\mvnw.cmd -q -DskipTests compile
```

Backend showtime-service:

```powershell
cd backend\showtime-service
.\mvnw.cmd -q -DskipTests compile
```

## Huong tiep theo

- Hoan thien CRUD rap, phong chieu va ghe tren frontend.
- Lien ket lich chieu voi phim, rap, phong va gia ve that.
- Them man hinh dat ghe, thanh toan va quan ly ve.
- Them phan quyen admin/user ro rang hon.
- Them validate form va thong bao loi than thien hon.
- Bo sung test cho API quan trong.
