# Project Title

EchoRealm

## Description

EchoRealm is a real-time communication platform that allows users to engage in various forms of messaging, including chat rooms, mumble (voice messages), and shout (broadcast messages). The application is designed to facilitate seamless communication among users with a focus on user experience and performance.

## Installation Instructions

### Client

1. Navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Server

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

## Usage

- Access the client application in your browser at `http://localhost:3000`.
- The server will run on `http://localhost:5000`.

## Features

- **Chat Rooms**: Engage in group chats with multiple users.
- **Mumble**: Send voice messages to other users.
- **Shout**: Broadcast messages to all users in a chat room.
- **User Profiles**: Manage your account and view friends' profiles.
- **Real-time Notifications**: Get notified of new messages and updates.

## Folder Structure

### Client

```
client/
├── public/                  # Static files
├── src/                     # Source files
│   ├── api/                 # API calls
│   ├── components/          # Reusable components
│   ├── features/            # Feature-specific components
│   ├── hooks/               # Custom hooks
│   ├── pages/               # Page components
│   └── utils/               # Utility functions
└── package.json             # Client dependencies
```

### Server

```
server/
├── src/
│   ├── config/              # Configuration files
│   ├── features/            # Feature-specific logic
│   ├── middleware/          # Middleware functions
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   └── utils/               # Utility functions
└── package.json             # Server dependencies
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your changes to your forked repository.
5. Create a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
