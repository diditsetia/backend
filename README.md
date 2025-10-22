# 🧭 Backend (Authentication System)

Ini adalah **backend** dari project Authentication System
Express,Node.js dan MySQL
API ini didesain agar dapat diintegrasikan dengan aplikasi frontend  React js dengan dukungan JWT Authentication dan CORS.


## 🚀 Cara Menjalankan Project

### 1️⃣ Clone Repository

git clone 
cd ke nama folder backend

akses :
http://localhost/phpmyadmin/

Buat nama db baru :
auth_system

import sql yang sudah saya sediakan di folder backend.
jangan lupa jalankan xampp nya.

Pastikan sudah terpasang Node.js versi terbaru.
npm install

Jalankan Aplikasi
node server.js

Server akan berjalan di:
http://localhost:5001

REST API :
http://localhost:5001/login
Method :
POST

Headers: 
Content-Type : application/json

Body -> JSON
{
  "email": "didit@example.com",
  "password": "123456"
}


Tech Stack
Express
Node.js 
MySQL
JWT + HttpOnly Cookie



🏗️ Arsitektur Aplikasi

Struktur folder proyek:

backend/
├── node_modules/
├── .env
├── db.js
├── package.json
├── package-lock.json
├── README.md
└── server.js

Penjelasan:

server.js
File utama yang berisi konfigurasi server Express, middleware, dan endpoint untuk register/login.

db.js
Berisi konfigurasi koneksi ke database MySQL.

.env
Menyimpan variabel lingkungan seperti host database, user, password, dan JWT secret.

package.json
Menyimpan daftar dependensi dan skrip npm untuk menjalankan server.




# backend
