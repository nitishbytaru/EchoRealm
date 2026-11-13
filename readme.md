# 🌐 EchoRealm

**EchoRealm** is a social web app that works like a digital clubhouse: chat privately with friends, shout to the whole community, send short notes called Mumbles, and choose how much of your identity to show. Messages and notifications arrive in real time.

---

## ✨ Three Ways to Talk

### 💬 EchoLink: private chats

- **One-on-one chat** with any friend.
- **Group chats** with a name and a custom group picture.
- **Group admins:** whoever creates a group becomes its admin and can add or remove members. Other members can leave the group.
- **Chat menu** (three dots): clear the chat, delete the chatroom, or block the other person.
- **Images:** upload and send pictures inside a chat.

### 📢 EchoShout: the public chatroom

- **Public messages** that everyone sees in real time.
- **@mentions:** type `@` followed by a username to tag someone.
- **Anonymous posting** when Anonymous Mode is on.

### 🤫 EchoMumble: short notes

- **Send a Mumble** to another user. It shows your username unless Anonymous Mode is on, in which case the recipient can't see who sent it.
- **Opt-in inbox:** "Accept Mumbles" in your settings controls whether people can send you Mumbles.
- **Pin up to 4 Mumbles** to your profile for others to see.
- **Likes:** other users can like pinned Mumbles, and your profile shows your friend count and total likes across your Mumbles.

---

## 👥 Accounts and Friends

- **Sign in** with a username and password. Registration also asks for an email.
- **Find Users:** search by username and send a friend request.
- **Requests:** accept or decline incoming friend requests.
- **My Friends:** see all your connections.
- **Blocked Users:** review the people you've blocked and unblock them.

---

## 🛠️ Personalization

- **Profile:** change your avatar, username or email.
- **Become Anonymous:** hide your identity on Mumbles and EchoShout posts.
- **Accept Mumbles:** turn incoming Mumbles on or off.
- **Light and dark themes:** a warm cream interface or a deep gray one, switched with the sun/moon button.

### Real-time notifications

Colored badges in the navigation bar alert you to new messages, Mumbles and friend requests. On phones, the main tabs (Chats, Shouts, Mumbles, Profile) move to a bottom navigation bar.

### Design: Neo-Brutalism

EchoRealm uses hard-edged cards and buttons, thick borders, flat solid colors, and offset shadows that respond when you hover or click.

---

## 🚀 Tech Stack

| Area | Technologies |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Redux Toolkit, Tailwind CSS 4, shadcn/ui |
| **Backend** | Node.js, Express 4, JWT in an HTTP-only cookie |
| **Database** | MongoDB with Mongoose |
| **Real-time** | Socket.IO |
| **Media** | Cloudinary, Multer |

---

## 📖 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- A MongoDB database, local or hosted
- A [Cloudinary](https://cloudinary.com/) account for image uploads

### 1. Clone and install

```bash
git clone https://github.com/nitishbytaru/EchoRealm.git
cd EchoRealm
(cd server && npm install)
(cd client && npm install)
```

### 2. Add environment variables

`server/.env`

```env
PORT=8000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

`client/.env.local`

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=optional_google_client_id
```

Set `NEXT_PUBLIC_BACKEND_URL` even for local development. Without it, the client looks for the API on port 3000, which is the client's own port.

### 3. Run the app

Use two terminals:

```bash
# Terminal 1: API and sockets on http://localhost:8000
cd server
npm run dev
```

```bash
# Terminal 2: web app on http://localhost:3000
cd client
npm run dev
```

---

## 📂 Project Structure

```plaintext
EchoRealm
├─ client                       # Next.js frontend
│  └─ src
│     ├─ api                    # API request functions
│     ├─ app                    # Routes and page components
│     │  ├─ page.tsx            # Sign-in and registration
│     │  └─ (dashboard)
│     │     ├─ links            # EchoLink chats
│     │     ├─ shout            # EchoShout
│     │     ├─ mumbles          # Send and read Mumbles
│     │     └─ profile          # Profile, friends, blocked users
│     ├─ components             # Shared components and UI primitives
│     ├─ hooks                  # Custom React hooks
│     ├─ lib                    # API client and helpers
│     ├─ providers              # App-wide providers
│     ├─ sockets                # Socket.IO client
│     ├─ store                  # Redux store and slices
│     └─ utils                  # Utility functions
└─ server                       # Express backend
   ├─ public/temp               # Temporary upload storage
   └─ src
      ├─ index.js               # HTTP server, sockets, database startup
      ├─ app.js                 # Express app and routes
      ├─ config                 # Database and Cloudinary setup
      ├─ features
      │  ├─ auth                # Authentication
      │  ├─ echoLink            # Private and group chats
      │  ├─ echoMumble          # Mumbles
      │  ├─ echoShout           # Community chat
      │  └─ user                # Profiles and friends
      ├─ middleware             # Auth and upload middleware
      └─ utils                  # Utility functions
```

---

## 📣 Contributing

Contributions are welcome. Feel free to open an issue or submit a pull request.

## 🛡️ License

This project is licensed under the MIT License.

## 📬 Contact

- **Email:** [bndnitish24@gmail.com](mailto:bndnitish24@gmail.com)
- **LinkedIn:** [Nitish Bytaru](https://www.linkedin.com/in/nitishbytaru/)
