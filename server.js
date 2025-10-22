const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const db = require("./db.js");

dotenv.config();
const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"], // bisa array kalau nanti banyak domain frontend
    credentials: true, // wajib untuk kirim cookie JWT
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // izinkan semua method umum
    allowedHeaders: ["Content-Type", "Authorization"], // header yang diizinkan
  })
);

app.use(express.json());
app.use(cookieParser());

// ---------------------- REGISTER ----------------------
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: "Semua field wajib diisi!" });

  db.query(
    "SELECT * FROM users WHERE email = ? OR username = ?",
    [email, username],
    async (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Kesalahan server", error: err });

      if (result.length > 0)
        return res.status(400).json({
          success: false,
          message: "Email atau username sudah digunakan!",
        });

      const hashed = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashed],
        (err) => {
          if (err)
            return res
              .status(500)
              .json({ success: false, message: "Gagal mendaftar", error: err });

          res.status(201).json({
            success: true,
            message: "Registrasi berhasil!",
          });
        }
      );
    }
  );
});

// ---------------------- LOGIN ----------------------
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Email dan password wajib diisi",
    });

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err)
        return res.status(500).json({
          success: false,
          statusCode: 500,
          message: "Kesalahan pada server",
          error: err.message,
        });

      if (result.length === 0)
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "Email tidak ditemukan",
        });

      const user = result[0];
      const validPass = await bcrypt.compare(password, user.password);
      if (!validPass)
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: "Password salah",
        });

      // ✅ Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      // ✅ Simpan JWT di HttpOnly cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // aktifkan HTTPS di production
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 hari
      });

      // ✅ Kirim respons sukses
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Login berhasil",
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
        },
      });
    }
  );
});

// ---------------------- PROTECTED ROUTE ----------------------
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Token tidak ditemukan. Silakan login.",
    });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // simpan data user dari token
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token tidak valid atau sudah kadaluarsa",
    });
  }
};

app.get("/profile", verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Berhasil mengambil data profil",
    data: req.user,
  });
});

// ---------------------- CHECK AUTH ----------------------
app.get("/api/check-auth", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ valid: false });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.json({ valid: false });
    }
    return res.json({ valid: true, user: decoded });
  });
});

// ---------------------- LOGOUT ----------------------
app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({
    success: true,
    message: "Logout berhasil",
  });
});

// ---------------------- SERVER ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
