# Stationery Backend

Spring Boot REST API with JWT Authentication

## Tech Stack
- Java 21
- Spring Boot 3.2
- Spring Security + JWT (jjwt 0.11.5)
- Spring Data JPA + MySQL
- Lombok + MapStruct

## Run
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

## API Endpoints
| Method | URL | Auth |
|--------|-----|------|
| POST | /api/auth/login | Public |
| GET | /api/users | Required |
| GET | /api/users/{id} | Required |
| GET | /api/admin/dashboard | ROLE_ADMIN |
