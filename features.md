# EchoRealm: Features and How They Work

This document describes what EchoRealm does and how each feature works in the current code. It was written by reading the client and server source; the app was not run. Where the code doesn't yet do what a feature intends, the feature notes it and [Known gaps](#known-gaps) has the detail.

## Contents

1. [System overview](#system-overview)
2. [Accounts and sessions](#accounts-and-sessions)
3. [EchoLink: private and group chat](#echolink-private-and-group-chat)
4. [EchoShout: public chatroom](#echoshout-public-chatroom)
5. [EchoMumble: short notes](#echomumble-short-notes)
6. [Friends and blocking](#friends-and-blocking)
7. [Profiles and settings](#profiles-and-settings)
8. [Data clearing and account deletion](#data-clearing-and-account-deletion)
9. [Real-time events](#real-time-events)
10. [Data model](#data-model)
11. [API reference](#api-reference)
12. [Known gaps](#known-gaps)

---

## System overview

| Part | Role |
|---|---|
| **Client** (`client/`) | Next.js 16 App Router app. Every page is a client component. State lives in Redux slices: `auth`, `user`, `echoLink`, `echoShout`, `echoMumble`. |
| **Server** (`server/`) | Express 4 REST API under `/api/*`, with Socket.IO on the same HTTP server. Code is organized by feature. |
| **Database** | MongoDB through Mongoose. |
| **Media** | Multer saves an upload to `server/public/temp`, then it goes to Cloudinary (folder `echorealm`) and the temp file is deleted. |

A typical action works like this:

1. The client sends a REST request with the `echo-token` cookie.
2. The server's `isAuthenticated` middleware verifies the JWT and sets `req.user` to the user's ID.
3. The controller updates MongoDB and responds.
4. If other people need to know, the controller emits a Socket.IO event, and listening clients update their Redux state.

### Routes

| Route | Screen |
|---|---|
| `/` | Sign in and register |
| `/links` | Chat list |
| `/links/[recieverId]` | An open private or group chat |
| `/shout` | EchoShout |
| `/mumbles/read` | Mumble inbox |
| `/mumbles/send`, `/mumbles/send/[mumbleTo]` | Compose a Mumble |
| `/profile/edit` | Edit profile and preferences |
| `/profile/mumbles` | Your pinned Mumbles |
| `/profile/friends/list` | Friends |
| `/profile/friends/requests` | Incoming friend requests |
| `/profile/blocked-users` | Blocked users |
| `/profile/find-users` | User search |
| `/profile/account` | Data clearing and account deletion |
| `/profile/view/[viewProfileUserId]` | Another user's profile |

---

## Accounts and sessions

### Register and log in

- **Register** takes an email, username and password. Usernames and emails are unique and stored in lowercase. **This flow currently fails; see gap 1.**
- **Log in** takes a username and password. Spaces in the username are replaced with underscores before the lookup.
- **Google sign-in** has client code, but its button is commented out in `client/src/app/page.tsx`, so users can't reach it.

### Sessions

- A successful login or registration issues a 24-hour JWT in the `echo-token` cookie, which is HTTP-only, `secure` and `sameSite: none`.
- The client sets `allowFetch=true` in `localStorage`. On load, if that flag is set, it calls `/api/auth/profile` to restore the session.
- The dashboard layout sends anyone without a valid session back to `/`, and the sign-in page sends logged-in users to `/links`.
- Logging out clears the cookie, resets Redux and sets `allowFetch=false`.

---

## EchoLink: private and group chat

### Private chat

- A conversation's ID is the two user IDs, sorted and joined with a hyphen, so both people always resolve to the same document.
- The first message creates the conversation.
- A message has text and optionally one image. The composer allows up to 55 characters, a limit enforced only by the client.
- Opening a chat joins its socket room and marks its messages as read.
- New messages reach both people through `send_latest_echoLink_message`. People elsewhere in the app get an unread dot and a higher navigation badge through `new_privte_message_received`.
- The chat list is sorted by latest message.
- The server returns messages in pages of 7, but the chat screen has no way to load older pages (gap 8).

### Chat menu

| Action | What it does |
|---|---|
| **Clear Chat** | Empties the message list for **both** participants. |
| **Delete ChatRoom** | Deletes the whole conversation for **both** participants. |
| **Block User** | Intended to block the person. Currently only unfriends them (gap 3). |

### Group chat

- Creating a group takes a name, a picture and at least one friend. The creator becomes admin.
- The dialog treats the picture as optional, but the server requires it (gap 11).
- Admins see **Add Members** and **Remove Members**. Both send the complete new member list to the server.
- Non-admins see **Leave Group**. Admins have no leave option, and groups can't be deleted.
- Admin rights are checked only in the interface (gap 7).
- Group messages arrive through `new_groupChat_Message`, and opening a group loads its full history.
- Groups have no unread tracking or latest-message preview; the list shows member names instead.

### Finding someone to chat with

The search box in the chat list finds friends by username. If nothing matches, it offers a link to Find Users. A Mumble's **Direct Message** action also opens a chat with its sender.

---

## EchoShout: public chatroom

- One shared room for all users. New posts reach everyone through `send_latest_echoShout_message`.
- A post has text and optionally one image and @mentions.
- Mentions are added with the **@** button, which opens a user search. Typing `@` in the message box does nothing special.
- With Anonymous Mode on, the post is stored with the sender `anonymous`.
- Posts load 7 at a time, and scrolling to the top loads older ones.
- Reading posts needs no login at the API level, but the `/shout` screen sits behind the dashboard login check.

---

## EchoMumble: short notes

### Sending

1. Open the Mumble menu in the navigation and choose **Send**, or use **Send Mumble** on a profile.
2. Search for a user. Only people with Accept Mumbles on appear in the results.
3. Write up to 55 characters and send.

The recipient sees your username unless you have Anonymous Mode on, in which case the sender is stored as `anonymous` with no ID, so it can't be traced in the data. The recipient gets the Mumble live through `New_mumble_sent`.

### Inbox

Mumbles appear newest first, and unread ones have a **New** tag. Leaving or updating the inbox marks them read. Each card's menu offers:

- **Pin / Unpin**, with a server limit of 4 pinned Mumbles.
- **Delete**, confirmed through a toast action.
- **Direct Message** and **Block**, only when the sender isn't anonymous.

### Pins and likes

Pinning belongs to the recipient. Pinned Mumbles show under **My Mumbles** and on your public profile, where other users can like or unlike them.

---

## Friends and blocking

- **Find Users** searches usernames with a 400 ms delay, returns up to 5 people, and leaves out you and anyone you've blocked. The search starts pre-filled with `a`.
- Each result shows **Add Friend**, **Request Sent** or **Already Friends**.
- A sent request appears for the recipient immediately through `friendRequestReceived`, and adds to the Profile badge.
- **Requests** offers Accept, Reject and View Profile, but accepting and rejecting currently fail (gap 2).
- **My Friends** offers Unfriend and Block. Unfriending removes the connection on both sides.
- **Blocked Users** lists people you've blocked and lets you unblock them. Blocked users are hidden from your search results and Mumble inbox.

---

## Profiles and settings

### Edit profile

You can change your avatar (with a preview before saving), email, username and password. A blank password leaves it unchanged.

| Preference | Effect |
|---|---|
| **Become Anonymous** | Hides your name on Mumbles and EchoShout posts you send from then on. Doesn't apply to EchoLink. Earlier posts don't change. |
| **Accept Mumbles** | Controls whether you appear in Mumble search. The toggle doesn't currently save (gap 4). |

### Viewing another user

A profile shows the avatar, username, total likes, friend count, most-liked Mumble and pinned Mumbles. When the user has any Mumble to feature, it takes the place of the **Send Mumble** button.

### Theme

The app starts in dark mode and saves your choice in `localStorage`.

---

## Data clearing and account deletion

The Account Settings page offers these actions, each with a confirmation dialog:

| Action | Current behavior |
|---|---|
| Delete all chats | Deletes your private conversations for both participants. Group messages stay, despite what the on-screen text says. |
| Delete received Mumbles | Works. |
| Delete sent Mumbles | Doesn't remove your Mumbles (gap 6). |
| Delete all EchoShout messages | Doesn't remove your posts (gap 6). |
| Delete account | Removes your user record, friend record, private chats and received Mumbles. Sent Mumbles and EchoShout posts remain (gap 6). |

---

## Real-time events

The server emits these events, and the client only listens. Clients join rooms by emitting `joinMyPersonalRoom`, `joinEchoLink` or `joinGroupChat`.

| Event | Sent to | Purpose |
|---|---|---|
| `send_latest_echoLink_message` | Conversation room | New private message for an open chat |
| `new_privte_message_received` | **All connected clients** | Unread update; each client filters it (gap 5) |
| `new_groupChat_Message` | Group room | New group message |
| `send_latest_echoShout_message` | All connected clients | New EchoShout post |
| `New_mumble_sent` | Recipient's personal room | New Mumble |
| `friendRequestReceived` | Recipient's personal room | Updated request list |

---

## Data model

| Collection | Key fields |
|---|---|
| **User** | `username`, `email`, `password`, `avatar`, `isAcceptingMumbles`, `isAnonymous`, `numberOfPinnedMumbles` |
| **UserFriend** | `userId`, `friends[]`, `pendingFriendRequests[]`, `blockedUsers[]` |
| **EchoLink** | `uniqueChatId`, `messages[]`, `latestMessage` |
| **GroupChatRoom** | `groupName`, `groupProfile`, `messages[]`, `groupChatRoomMembers[]`, `admin` |
| **EchoShout** | `sender` (a username string), `message`, `attachments[]`, `mentions[]` |
| **EchoMumble** | `sender { senderId, username }`, `receiver`, `message`, `pinned`, `likes[]`, `mumbleStatus` |

---

## API reference

All routes need the login cookie except register, login and `GET /api/echoShout/messages`.

**`/api/auth`**

| Method | Path | Purpose |
|---|---|---|
| POST | `/register` | Create an account |
| POST | `/login` | Log in |
| GET | `/profile` | Current user |
| POST | `/logout` | Log out |

**`/api/user`**

| Method | Path | Purpose |
|---|---|---|
| GET | `/search/:userId` | Find a user by ID |
| GET | `/search/username/:username` | Search by username |
| GET | `/user/:userId` | Profile and pinned Mumbles |
| GET | `/mumble/:userId/likes-friends` | Profile stats |
| PATCH | `/user` | Update profile |
| DELETE | `/account` | Delete account |

**`/api/friends`**

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Friend list |
| GET | `/requests` | Incoming requests |
| PATCH | `/requests/:senderId` | Send a request to this user |
| PUT | `/requests` | Accept or reject |
| PUT | `/remove-or-block` | Unfriend or block |
| GET | `/blockedUsers` | Blocked list |
| PATCH | `/blockedUsers/unblock/:userId` | Unblock |

**`/api/echoLink`**

| Method | Path | Purpose |
|---|---|---|
| POST | `/messages` | Send a private message |
| GET / PATCH | `/messages/:roomId` | Read messages / mark as read |
| GET | `/friends/private` | Chat list |
| GET | `/friends/search/:roomId` | Search friends (the parameter is the search term) |
| DELETE | `/chats/:roomId` | Clear a chat |
| DELETE | `/chatRoom/:roomId` | Delete a chat |
| DELETE | `/chatRooms` | Delete all your chats |
| POST | `/groupChat/create` | Create a group |
| POST | `/groupChat/messages/send` | Send a group message |
| GET | `/groupChat/:groupId` | Group details and messages |
| PATCH | `/groupChat/:groupId/leave` | Leave a group |
| PATCH | `/groupChat/:groupId/members` | Replace the member list |

**`/api/echoShout`**

| Method | Path | Purpose |
|---|---|---|
| GET | `/messages` | Read posts, paginated |
| POST | `/messages` | Create a post |
| DELETE | `/messages` | Delete your posts |

**`/api/echoMumble`**

| Method | Path | Purpose |
|---|---|---|
| GET | `/mumbles` | Your inbox |
| POST | `/mumbles` | Send |
| PATCH | `/mumbles` | Mark all read |
| PATCH | `/pin/:mumbleId` | Toggle pin |
| PATCH | `/like/:mumbleId` | Toggle like |
| DELETE | `/:mumbleId` | Delete one |
| DELETE | `/recieved` | Delete received |
| DELETE | `/sent` | Delete sent |

---

## Known gaps

Found by reading the code, most serious first within each group.

### Features that don't work

| # | Problem | Cause |
|---|---|---|
| 1 | **New users can't sign up.** | `registerUser` assigns to a `const avatarUrl` and an undeclared `publicId` when no avatar is sent, which throws. Email sign-up never sends one, and the Google route is hidden. |
| 2 | **Friend requests can't be accepted or rejected.** | The client sends `{ senderId, action }`; `handleFriendRequest` reads `{ requestedUserId, willAccepct }` and returns 400. |
| 3 | **Blocking only unfriends.** | The client sends `action: "block"`; `removeOrBlockMyFriend` reads `block`, which stays false. The toast wording is also reversed. |
| 4 | **Accept Mumbles doesn't save.** | The client sends `udatedIsAcceptingMumbles` (typo); the server reads `updatedIsAcceptingMumbles`. |
| 6 | **"Delete sent Mumbles", "Delete EchoShout messages" and part of account deletion do nothing.** | Queries compare `req.user` (an ID) with `sender`, which is an object on Mumbles and a username on shouts. |
| 8 | **Private chats show only the latest 7 messages.** | The chat screen has no scroll handler for older pages. |
| 9 | **Image-only messages fail.** | The composer allows them, but the server requires text. |
| 10 | **Profile friend count is wrong.** | It counts `UserFriend` documents, which is always 0 or 1, not friends. |
| 11 | **Creating a group without a picture fails.** | The dialog allows it, but the server reads the file unconditionally. |
| 12 | **Chat search errors for users with no friend record.** | `searchEchoLinkFriends` destructures a null result. |
| 13 | **Mumble badge is incomplete on page load.** | Only the inbox page fetches Mumbles, so the badge counts only live arrivals until then. |
| 14 | **Pin limit messages disagree.** | The server allows 4; the client warns at 5. |

### Security and privacy

| # | Problem | Cause |
|---|---|---|
| A | **Passwords are stored and compared in plain text.** | Hashing is commented out in `user.model.js`. |
| 5 | **Private message data goes to every connected client.** | `new_privte_message_received` uses `io.emit`, and filtering happens in the browser. |
| B | **Socket rooms have no access control.** | Sockets aren't authenticated, so any client can join any room by ID. |
| C | **Conversations can be read or changed by non-participants.** | Message, clear, delete and group routes don't check membership. |
| 7 | **Group admin rights aren't enforced.** | `updateMembersInGroup` doesn't check who is calling. |
| D | **Any logged-in user can delete or pin any Mumble.** | Those routes don't check ownership. |
| E | **Blocks and Mumble opt-outs aren't enforced when sending.** | Send routes don't check them. `getMyPrivateFriends` also reads `blockedUsers` from the wrong model. |
| F | **Google sign-in, if re-enabled, can't be trusted.** | The browser decodes the token and sends its `sub` as a password; the server never verifies it. |
| G | **Search results expose email addresses.** | `searchUsers` returns every field except the password. |
| H | **Uploads aren't validated on the server.** | Multer has no size or type limits, and files are saved under their original names. |
