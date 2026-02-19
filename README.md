# 🎥 Time-Locked Video Sharing Platform

A full-stack Node.js application where users can:

- 🔐 Upload time-locked videos
- ⏳ Automatically unlock videos after a specific date
- 🌍 Share videos publicly
- 💬 View public video feed in real-time using Socket.io

---

## 🚀 Features

### 👤 Authentication

- User signup & login
- JWT-based authentication
- Secure HTTP-only cookies
- Password hashing using bcrypt

### 🎬 Video Management

- Upload videos
- Set unlock date & time
- Automatic locking/unlocking via cron job
- Delete videos (also removes files from storage)

### 🌐 Public Sharing

- Post unlocked videos to public feed
- Real-time updates using Socket.io
- Public feed API endpoint

### ⚙️ Background Automation

- Cron job runs every 30 seconds
- Automatically updates locked → released

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- EJS
- Socket.io
- Multer (File Uploads)
- bcrypt (Password Hashing)
- JWT Authentication
- node-cron

---

## 📁 Project Structure
