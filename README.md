# Tiketku API &middot; [![codecov](https://codecov.io/gh/travelynk/final-project-backend/graph/badge.svg?token=FHP8UU0ML6)](https://codecov.io/gh/travelynk/final-project-backend)

This repository contains the backend codebase for Team 6's final project. The backend is built using Node.js and Express.js, following a layered architecture to ensure clean code organization and scalability.
The backend is responsible for handling business logic, managing the database, and providing APIs for the frontend.

## API List

1.  Auth API
2.  Profile API
3.  Flight API
4.  Seat Flight API
5.  Booking Flight API
6.  Voucher API
7.  Payment API
8.  Notification API
9.  Country API
10. City API
11. Airport API
12. Terminal API
13. Airline API
14. User API
15. Other API

## Setup Tools

To use the API, you need the source code and Node.js. Follow the steps below:

1. [Download the source code.](https://github.com/travelynk/final-project-backend.git)
    - Or clone: `git clone https://github.com/travelynk/final-project-backend.git`.
2. [Download and install Node.js](https://nodejs.org/download), which is used for dependency management.
3. Navigate to the root directory `/final-project-backend` and run the command `npm install` to install the dependencies listed in the [package.json](/package.json) file.

Once completed, you can run various commands provided from the command line.

## Using NPM Scripts

The [package.json](/package.json) includes the following commands and tasks:

|-------------------------------------------------------------------------------------|
| Task                       | Description                                            |
| ---------------------------| -------------------------------------------------------|
| `npm install`              | Untuk menginstal semua dependensi proyek.              |
| `npm run start`            | Untuk menjalankan aplikasi dalam mode produksi.        |
| `npm run dev`              | Untuk menjalankan aplikasi dalam mode pengembangan.    |
| `npm run test`             | Untuk menjalankan pengujian dengan cakupan.            |
| `npm run generate-openapi` | Untuk menghasilkan dokumentasi OpenAPI.                |
| `npm run lint`             | Untuk memeriksa kode dengan ESLint.                    |
| `npm run lint:fix`         | Untuk memperbaiki masalah linting secara otomatis.     |
| `npm run db:reset`         | Untuk mereset database menggunakan Prisma.             |
| `npm run db:migrate`       | Untuk menjalankan migrasi database menggunakan Prisma. |
| `npm run db:studio`        | Untuk membuka Prisma Studio.                           |
| `npm run db:seed`          | Untuk menjalankan seeder database.                     |
---------------------------------------------------------------------------------------

## Project Structure

```plaintext
    ───.github                      # GitHub configuration files
    │   └───workflows               # GitHub Actions workflows
    │   └───lcov-report             # LCOV report files
    │       ├───configs             # Configuration files
    │       ├───controllers         # Controller files
    │       ├───middlewares         # Middleware files
    │       ├───services            # Service files
    │       ├───utils               # Utility files
    │       ├───validations         # Validation files
    │       └───views               # View files
    ├───prisma                      # Prisma ORM files
    ├───coverage                    # Coverage reports
    │   ├───migrations              # Migration files
    │   └───seeder                  # Seeder files
    └───src                         # Source code
        ├───configs                 # Configuration files
        ├───controllers             # Controller files
        │   └───__test__            # Controller test files
        ├───docs                    # Documentation files
        ├───middlewares             # Middleware files
        │   └───__test__            # Middleware test files
        ├───routes                  # Route files
        │   └───api                 # API route files
        │       └───v1              # Version 1 API route files
        ├───services                # Service files
        │   └───__test__            # Service test files
        ├───utils                   # Utility files
        ├───validations             # Validation files
        └───views                   # View files
```

### API Documentation
1.  [Travelynk-API-Sweager](https://api-tiketku-travelynk-145227191319.asia-southeast1.run.app/api/v1/docs)
2.  [Travelynk-API-Postman](https://documenter.getpostman.com/view/40170047/2sAYBbe98U)