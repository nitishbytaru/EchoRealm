# 🌐 EchoRealm

**EchoRealm** is a cutting-edge social web application that connects users through direct messaging, group interactions, and dynamic community discussions. With real-time notifications, customizable privacy options, and an intuitive interface, **EchoApp** delivers a seamless and engaging user experience. 🚀  

---
## 📂 Folder Structure

### **Client**
```plaintext
├─ client
│   ├─ .env
│   ├─ public
│   ├─ src
│       ├─ api            # Authentication APIs
│       ├─ app            # Redux store setup
│       ├─ components     # Reusable components
│       ├─ features       # Feature-based organization
│           ├─ echoLink   # One-to-one and group chats
│               ├─ api
│               ├─ components
│               ├─ slices
│               ├─ views
│           ├─ echoMumble # Mumbles functionality
│           ├─ echoShout  # Community chat
│           └─ profile    # User profile management
│       ├─ pages          # Reusable pages
│       ├─ sockets        # Socket.io configuration
│       └─ utils          # Utility functions
│   ├─ tailwind.config.js # Tailwind CSS configuration
│   ├─ vercel.json        # Deployment configuration
│   └─ vite.config.js     # Vite.js configuration
```

### **Server**
```plaintext
└─ server
    ├─ .env
    ├─ public
    ├─ src
        ├─ app.js         # Server configuration
        ├─ config         # Database and utility configurations
        ├─ features       # Feature-based backend logic
            ├─ auth       # Authentication
            ├─ echoLink   # Messaging and group chat
                ├─ controller
                ├─ models
                └─ routes
            ├─ echoMumble  # Mumble-related logic
            ├─ echoShout   # Community chat logic
            └─ user        # User profile management
        ├─ index.js       # Server and socket setup
        ├─ middleware     # Middleware functions
        └─ utils          # Utility functions
```

---

## 🚀 Technologies Used
- **Frontend**: React, Redux, Tailwind CSS, Vite.js.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB.
- **Real-Time**: Socket.io.
- **Deployment**: Vercel.

---

## 📖 Getting Started

### Prerequisites
- Install [Node.js](https://nodejs.org/).
- Install [Vite.js](https://vitejs.dev/).
- Set up MongoDB.

### Installation
1. Clone the repository:
   ```bash
   https://github.com/nitishbytaru/EchoRealm.git
   ```
2. Navigate to the client and server folders and install dependencies:
   ```bash
   cd client && npm install
   cd server && npm install
   ```

3. Set up `.env` files for client and server per your configuration.

4. Run the development servers:
   - **Client**: 
     ```bash
     npm run dev
     ```
   - **Server**: 
     ```bash
     npm start
     ```

---


## ✨ Key Features

### 1️⃣ **EchoLink**
- 🤝 Users can connect by sending **friend requests**.
- 📩 **One-to-one messaging** or **group chats** with friends.
- 🚫 Option to **block users** for privacy.

### 2️⃣ **Shout**
- 🌍 A **community chatroom** where users can participate in discussions.
- Perfect for engaging with a larger audience!

### 3️⃣ **Mumble**
- 📤 Send **short messages** to random users.
- 📌 **Pin mumbles** to your profile for others to see.
- ❤️ Other users can **like pinned mumbles**.
- 📊 User profiles showcase:
  - Friends list.
  - **Total aggregated likes** on all their mumbles.

### 4️⃣ **Anonymous Mode**
- 🕵️ Switch to **anonymous mode** for privacy:
  - Send **anonymous mumbles**.
  - Participate anonymously in **EchoShout**.

### ⚡ **Real-Time Notifications**
- Instant alerts for:
  - New messages.
  - New mumbles.
  - Friend requests.

### 🔒 **Privacy Controls**
- Block unwanted users and manage your connections effortlessly.

---

## 📣 Contributing
Contributions are welcome! Feel free to submit issues or pull requests to improve this project. 😊

---

## 🛡️ License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

### 🌟 **Let's Echo Together!**
Connect, chat, and share moments with **EchoApp** – your new favorite social hub! 🎉

📧 **Email**: [bndnitish24@gmail.com](mailto:bndnitish24@gmail.com)  
🔗 **LinkedIn**: [Nitish Bytaru](https://www.linkedin.com/in/nitishbytaru/)
