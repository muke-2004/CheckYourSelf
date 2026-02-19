# 🎬 Video Time Capsule

A full-stack Node.js web application that lets users upload videos with a future unlock date — like a **time capsule**. Once the unlock time passes, videos can be shared publicly for the community to compare before/after moments.

---

## 🚀 Features

- **User Authentication** — Signup/Login with hashed passwords (bcrypt) and JWT-based sessions
- **Video Upload** — Upload personal videos with a title, description, and a future unlock date
- **Time-Lock System** — Videos stay locked until the unlock date; a cron job automatically releases them every 30 seconds
- **Lock/Delete Controls** — Manually lock or delete your own videos
- **Public Feed** — Post unlocked videos publicly; viewers can compare the original vs. the updated ("after") video side-by-side
- **Real-time Updates** — New public posts appear instantly via Socket.IO without page refresh

---

## 🛠️ Tech Stack

| Layer        | Technology         |
| ------------ | ------------------ |
| Runtime      | Node.js            |
| Framework    | Express.js         |
| Templating   | EJS                |
| Database     | MongoDB + Mongoose |
| Auth         | JWT + bcrypt       |
| File Uploads | Multer             |
| Real-time    | Socket.IO          |
| Scheduling   | node-cron          |
| Frontend     | Bootstrap 5        |

---

## 📁 Project Structure

```
├── index.js                  # Main server file
├── auth.js                   # JWT token creation & validation
├── .env                      # Environment variables (not committed)
├── uploads/                  # Uploaded video files
├── public/                   # Static assets (CSS, JS)
├── middleware/
│   ├── auth.js               # restrictToLoggedInUserOnly
│   └── authentication.js     # checkForAuthenticationCookie
├── models/
│   ├── userModel.js          # User schema
│   ├── videosModel.js        # Video schema
│   └── publicVideoModel.js   # Public post schema
└── views/
    ├── login.ejs
    ├── signup.ejs
    ├── profile.ejs
    ├── addnew.ejs
    ├── public.ejs
    ├── publicchat.ejs
    └── partials/
        └── nav.ejs
```

---

## 🔄 How the Time-Lock Works

1. When uploading, you set a future `unlockAt` datetime
2. The video's status is set to `"released"` on upload (you can manually lock it)
3. A **cron job runs every 30 seconds** and automatically sets any video with `status: "locked"` and a past `unlockAt` to `"released"`
4. Once released and the unlock time has passed, a **Public** button appears on the video card
5. Clicking Public lets you upload a new "after" video and share both side-by-side in the public feed

---

## 🧠 Future Improvements

- Move file storage to Cloudinary / AWS S3
- Add video thumbnails
- Add like/comment system
- Add pagination for public feed
- Add role-based access control
- Add rate limiting
- Add helmet security middleware

---

## Any one intested on this project can make changes to it

⚙️ Setup & Installation

1. Clone the repository
   bashgit clone https://github.com/muke-2004/CheckYourSelf.git
   cd video-time-capsule
2. Install dependencies
   bashnpm install
3. Create a .env file in the root directory
   MONGO_URL=mongodb://localhost:27017/videocapsule
   SECRET=your_jwt_secret_key_here
   PORT=5000
4. Create the uploads directory
   bashmkdir uploads
5. Start the server
   bashnode index.js
   The app will be running at http://localhost:5000

## 📡 API Routes

AUTH

| Method | Route     | Description              |
| ------ | --------- | ------------------------ |
| GET    | `/signup` | Signup page              |
| POST   | `/signup` | Create new account       |
| GET    | `/login`  | Login page               |
| POST   | `/login`  | Authenticate user        |
| GET    | `/logout` | Clear session and logout |

### Videos (Protected)

| Method | Route         | Description           |
| ------ | ------------- | --------------------- |
| GET    | `/profile`    | View your videos      |
| GET    | `/addnew`     | Upload form           |
| POST   | `/addnew`     | Upload a new video    |
| DELETE | `/delete/:id` | Delete a video        |
| PATCH  | `/lock/:id`   | Manually lock a video |

### Public Feed

| Method | Route              | Description                 |
| ------ | ------------------ | --------------------------- |
| GET    | `/public/:id`      | Upload "after" video form   |
| POST   | `/public/:id`      | Submit video to public feed |
| GET    | `/publicchat`      | View public feed            |
| GET    | `/api/public-feed` | JSON API for public posts   |

---
