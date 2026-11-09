# EchoRealm: UI and UX

This document describes EchoRealm's interface as built: its design language, navigation, screens and interaction patterns, followed by the problems worth fixing. It comes from reading the client code; the app wasn't run, so visual findings are derived from the styles rather than from screenshots.

## Contents

1. [Design language](#design-language)
2. [Design tokens](#design-tokens)
3. [Layout and navigation](#layout-and-navigation)
4. [Screens](#screens)
5. [Interaction patterns](#interaction-patterns)
6. [Issues and recommendations](#issues-and-recommendations)

---

## Design language

EchoRealm uses **Neo-Brutalism**: playful, tactile and deliberately loud.

- Thick 3px outlines on cards, buttons and inputs
- Hard offset shadows with no blur
- Flat, saturated color with no gradients
- Heavy type, mostly bold and extrabold
- Rounded corners (16px base), which soften the style and make it friendlier than classic brutalism
- Pieces that move like physical objects: they lift on hover and press in on click

The voice is informal. Private chats are "whispers", public posts are "shouts", and the product areas are named EchoLink, EchoShout and EchoMumble.

**Consistency:** the system is applied fully on the sign-in page, navigation, chat list and chat window, EchoShout, Edit Profile, and the Mumble menu. Twelve other files still carry an older dark zinc-and-indigo look; see [issue 1](#1-two-visual-systems-are-mixed).

---

## Design tokens

Tokens are defined in `client/src/app/globals.css`.

### Color

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--background` | `#FFF9F0` | `#121212` | Page |
| `--card` | `#FFFFFF` | `#1E1E1E` | Panels |
| `--foreground` | `#111111` | `#FFFFFF` | Text |
| `--muted` | `#F0EBE3` | `#2A2A2A` | Quiet surfaces, hover |
| `--muted-foreground` | `#555555` | `#AAAAAA` | Secondary text |
| `--primary` | `#FFD43B` | `#FFD43B` | Main actions, your own messages, EchoLink active state |
| `--secondary` | `#4D96FF` | `#4D96FF` | EchoShout active state, unread indicators |
| `--nb-accent` | `#B983FF` | `#C77DFF` | Profile active state, Mumble badges |
| `--nb-success` | `#6BCB77` | `#6BCB77` | File-attached dot |
| `--nb-warning` | `#FFB84C` | `#FFB84C` | Friend request badges |
| `--destructive` | `#FF6B6B` | `#FF6B6B` | Log out, unread message badge |
| `--nb-border-color` | `#000000` | `#F5F5F5` | Outlines |
| `--nb-shadow-color` | `#000000` | `#F5F5F5` | Shadows |

In dark mode, outlines and shadows flip to near-white, which keeps the hard-edged look on a dark background.

### Typography

| Role | Setting |
|---|---|
| Interface font | Space Grotesk, 400–700 |
| Numbers (character counts) | Geist Mono |
| Page titles | `text-xl` to `text-2xl`, bold or extrabold |
| Body and controls | `text-sm`, medium or bold |
| Form labels | `text-xs`, bold, uppercase, wide tracking |

### Shape, shadow and motion

| Token | Value |
|---|---|
| Radius | `1rem`; `rounded-xl` for controls, `rounded-2xl` for panels |
| Border | 3px standard, 2px on small elements |
| Shadow small / default | `4px 4px 0` / `6px 6px 0` |
| Shadow large and hover | `8px 8px 0` |
| Shadow pressed | `2px 2px 0` |
| Press motion | 150–200ms with an overshoot curve, `cubic-bezier(0.34, 1.56, 0.64, 1)` |

| Animation | Used on |
|---|---|
| `fade-in-up` (0.25s) | Page changes |
| `scale-in` (0.2s) | New message bubbles |
| `tap-interactive` | Lifts 2px on hover, presses 1px on click |
| `card-interactive` | Lifts 3px on hover |

### Components

Primitives are in `client/src/components/ui`, built on shadcn and Base UI: alert dialog, avatar, button, card, dialog, dropdown menu, input, sheet, skeleton, switch, toast and tooltip.

Buttons come in `default`, `outline`, `secondary`, `ghost`, `destructive` and `link` variants, in sizes from `xs` to `lg`, with icon-only sizes.

---

## Layout and navigation

### Page shell

A sticky 64px header sits above a content area capped at 1280px. Page changes use the `fade-in-up` animation.

### Desktop header (768px and up)

Logo, then **EchoLink**, **EchoShout**, **EchoMumble** and **About**, then the theme switch and a chip with your avatar and username. Each area has its own active color: yellow for EchoLink, blue for EchoShout and purple for Profile. EchoMumble opens a dialog instead of a page, so it has no active state.

### Mobile navigation (under 768px)

The links move to a fixed bottom bar: **Chats**, **Shouts**, **Mumbles** and **Profile**. The header keeps the logo, theme switch and avatar.

### Badges

| Location | Color | Counts |
|---|---|---|
| EchoLink / Chats | Red | Conversations with unread messages |
| EchoMumble / Mumbles | Purple | Unread Mumbles |
| About / Profile | Orange | Pending friend requests |

### Responsive behavior

| Screen | Mobile | Tablet and desktop |
|---|---|---|
| Chat | List and conversation are separate views, with a back arrow | List beside conversation; list is 4 of 12 columns, then 3 on large screens |
| Profile | Sidebar stacks above content, links wrap | 240px sticky sidebar |
| Card grids | 1 column | 2–3 columns |

---

## Screens

### Sign in (`/`)

A centered 384px column with the logo, tagline and a single card. Two tabs switch between **Register** and **Log In**, with Log In as the default. The theme button is fixed in the corner. Submitting swaps the whole page for the loading animation.

### Chat list (`/links`)

A search box and a create-group button sit above conversations, each showing avatar, name and a preview cut to 30 characters. Unread rows have blue preview text and a dot. On desktop, the right side shows a prompt until you choose a chat. The empty state reads "No active conversations. Start one!"

### Conversation (`/links/[id]`)

- A header card with avatar, name, and a three-dot menu
- Bubbles with hard shadows: yours are yellow on the right, theirs are card-colored on the left, with a relative time under each
- A composer with an attach button, text field, character counter and send button

### EchoShout (`/shout`)

A centered 896px column with one history panel. Bubbles show `@username` above and the time below, and mentions appear in blue before the text. The **@** button opens a floating user search, and chosen mentions appear as chips above the composer. Skeleton bubbles appear while loading.

### EchoMumble menu

A dialog with two large choices: **Inbox** and **Send**.

### Send Mumble

A centered card with user search, a panel showing the selected person, and a message bar that stays disabled until someone is selected.

### Mumble inbox

A responsive card grid. Unread cards are tinted and tagged **New**, pinned cards show a pin, and actions sit in a three-dot menu. The empty state reads "Your inbox is empty."

### Profile area

A sidebar with your avatar, name, email and seven links, plus a red **Log out** button.

| Page | Contents |
|---|---|
| **Edit Profile** | Avatar with hover camera, three fields, two switches, Save |
| **My Mumbles** | Pinned cards with like counts |
| **My Friends** | User cards with Unfriend and Block |
| **Requests** | User cards with Accept, Reject and View Profile |
| **Blocked Users** | User cards with Unblock |
| **Find Users** | Search with user cards |
| **Account Settings** | Danger Zone banner, four clear-data rows, Delete Account |
| **User Profile** | Identity, stats, featured Mumble, Mumble grid with likes |

---

## Interaction patterns

| Pattern | How it behaves |
|---|---|
| **Page load** | Bouncing-ball animation for full pages |
| **List load** | Skeleton cards that match the final layout |
| **Small waits** | Spinner in the header or in place of the composer |
| **Feedback** | Toasts for success and failure |
| **Sending** | Enter sends; the composer becomes a spinner until the server responds |
| **Character limit** | Counter turns red past 55 and send disables |
| **Search** | Results appear after a 400ms pause |
| **Attachments** | Green dot on the paperclip; the placeholder shows the file name |
| **Scrolling** | Jumps to the newest message; scrolling to the top of EchoShout loads older posts |
| **Destructive actions** | Confirmation dialogs on Account Settings; toast confirmation for deleting a Mumble |
| **Theme** | Dark by default, saved per browser |

---

## Issues and recommendations

Ordered by impact on users.

### High priority

#### 1. Two visual systems are mixed

Twelve files use hardcoded `zinc`, `indigo` and `rose` classes in place of the Neo-Brutalist tokens: My Mumbles, My Friends, Requests, Blocked Users, Find Users, Account Settings, User Profile, Mumble inbox, Send Mumble, and all three group dialogs. Moving between tabs in the same sidebar changes the whole look.

**Fix:** replace them with theme tokens and the standard Card, Button and Input styles.

#### 2. Text disappears in light mode

Those screens hardcode pale text meant for dark backgrounds. For example, `text-zinc-100` page titles and `text-zinc-200` names sit on a white card, so they are close to invisible. Issue 1's fix resolves this too.

#### 3. Many color classes don't exist

Tailwind has no `zinc-555`, `zinc-650`, `zinc-350`, `zinc-850`, `indigo-650`, `indigo-450`, `rose-250`, `rose-450`, `red-650` or `red-750`. They produce no CSS. Primary actions such as **Add Friend**, **Accept**, **Unblock** and **Create Group** use `bg-indigo-650`, so they likely lose their fill, leaving pale text on nothing.

#### 4. Text is too small

`text-[9px]` and `text-[10px]` are used for descriptions, emails, helper text and even button labels, including the warnings explaining permanent deletion on Account Settings.

**Fix:** set 12px as the minimum, and use 14px for anything people need to read before acting.

#### 5. Destructive actions have no confirmation

**Clear Chat**, **Delete ChatRoom**, **Block User** and **Unfriend** run with one click. Clear and Delete also affect the other person, which nothing explains.

**Fix:** use the existing alert dialog, and state who is affected.

### Medium priority

#### 6. Keyboard and screen reader support is thin

- Chat rows, search results and mention results are clickable `div` or `li` elements, so keyboards can't reach them.
- Icon-only buttons such as send, attach, more, and like have no accessible name. Only one `aria-label` exists outside the UI primitives.
- Form labels aren't tied to their inputs with `htmlFor`.
- Badges are bare numbers with no text for screen readers.
- New messages aren't announced.

#### 7. Some color pairs fall short on contrast

| Pair | Ratio | Where |
|---|---|---|
| White on `#B983FF` | 2.7:1 | Active Profile tab, Mumble badges |
| White on `#FF6B6B` | 2.8:1 | Log out, message badges |
| White on `#4D96FF` | 3.0:1 | Active EchoShout state, Log In tab |
| `#4D96FF` on white | 3.0:1 | Unread preview text |

WCAG AA asks for 4.5:1 for text. Dark text (`#111111`) passes on all three of these backgrounds.

#### 8. Motion ignores reduced-motion settings

There is no `prefers-reduced-motion` handling for the bounce animations, page transitions or per-message scale-in.

#### 9. Failed sign-ins lose the form

The form is replaced by the loader on submit and fields are cleared afterward, even on failure. A user with a mistyped password must retype everything.

**Fix:** keep the form on screen, show progress on the button, and clear only the password. Show errors beside the fields.

#### 10. Failures are often silent

Fetch errors on Friends, Blocked Users, Requests and the chat list only reach the console, so a failed load can look the same as an empty list. EchoShout send failures also show nothing, and the message is already gone from the box.

**Fix:** add inline error states with retry, and keep the unsent text.

#### 11. Navigation labels don't match

- The Profile area is **About** on desktop and **Profile** on mobile, and "About" doesn't describe it.
- EchoLink and EchoShout become Chats and Shouts on mobile.
- The header's avatar goes to Edit Profile on mobile but My Mumbles on desktop.
- The app's JavaScript breakpoint is 670px while CSS uses 768px, so screens in between mix the two layouts.

#### 12. Profile layout hides an action

The featured Mumble replaces **Send Mumble**, so that button disappears for exactly the most active users. Show both. The profile also tries to show an email the API doesn't send, leaving an empty line.

#### 13. Mobile chat height is fragile

Chat screens use `h-[calc(100vh-140px)]`, and `100vh` includes the mobile browser's address bar, so the composer can be pushed out of view. The `pb-safe` class on the bottom bar also isn't defined in the project's CSS, so it adds no safe-area padding. Use `dvh` units and `env(safe-area-inset-bottom)`.

### Lower priority

#### 14. Composer nesting on EchoShout

`MessageBar` brings its own background and top border into EchoShout's outlined bar, creating a box in a box.

#### 15. The 55-character limit feels tight

It applies to chats as well as Mumbles. It suits Mumbles, but a private conversation shouldn't stop at one short sentence.

#### 16. Copy needs a pass

- The page description is still "Next.js migration for EchoRealm".
- The sign-in placeholder uses "daisy@site.com".
- The tagline "modern, secure workspace" doesn't match a playful social app.
- Mumbles are described as "anonymous whispers" even though they're only anonymous when you turn that on.
- Success toasts repeat raw server text such as "cleared the all messages".
- "Delete All Chat Conversations" promises group chats too, which it doesn't delete.

#### 17. Find Users opens with an arbitrary search

The field is pre-filled with `a`. Suggested people or an empty prompt would explain the page better.

#### 18. Mentions aren't discoverable

Typing `@` in the message box does nothing; only the separate **@** button works. Chips also can't be removed before sending.

#### 19. Hidden scrollbars

`hide-scrollBar` removes visible scrolling cues on all the main lists. Keep a thin scrollbar on desktop.

### Recommended order

1. Migrate the twelve older files to tokens (issues 1–3).
2. Raise minimum text size and fix contrast (issues 4 and 7).
3. Add confirmations and error states (issues 5, 9 and 10).
4. Complete the accessibility pass (issues 6 and 8).
5. Align navigation, mobile layout and copy (issues 11–13 and 16).
