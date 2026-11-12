# EchoRealm: UI and UX

This document describes EchoRealm's interface as built: its design language, navigation, screens and interaction patterns, followed by the latest quality audit and what is still open. It comes from reading the client code and from running the Impeccable detector against the running app.

_Last audited: 12 November 2026, on branch `ui-neobrutalist-pass`._

## Contents

1. [Design language](#design-language)
2. [Design tokens](#design-tokens)
3. [Layout and navigation](#layout-and-navigation)
4. [Screens](#screens)
5. [Interaction patterns](#interaction-patterns)
6. [Quality audit](#quality-audit)

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

**Consistency:** the system is applied on every screen. No component uses raw palette classes (`zinc`, `indigo`, `rose`) or hardcoded hex colors; everything goes through the tokens below.

**Intentional detector exceptions:** Impeccable flags the hard offset shadows and the overshoot easing as advisories. Both are deliberate parts of the neo-brutalist direction and stay. The overshoot is turned off for people who ask for reduced motion.

---

## Design tokens

Tokens are defined in `client/src/app/globals.css`.

### Color

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--background` | `#FFF9F0` | `#0B0B0B` | Page |
| `--card` | `#FFFFFF` | `#171717` | Panels |
| `--foreground` | `#111111` | `#FFF6E8` | Text |
| `--muted` | `#F0EBE3` | `#232323` | Quiet surfaces, hover |
| `--muted-foreground` | `#555555` | `#B3ADA4` | Secondary text |
| `--primary` | `#FFD43B` | `#FFD43B` | Main actions, your own messages, EchoLink active state |
| `--secondary` | `#4D96FF` | `#4D96FF` | EchoShout active state, unread indicators |
| `--nb-accent` | `#B983FF` | `#C77DFF` | Profile active state, Mumble badges |
| `--nb-success` | `#6BCB77` | `#6BCB77` | File-attached dot |
| `--nb-warning` | `#FFB84C` | `#FFB84C` | Friend request badges |
| `--destructive` | `#FF6B6B` | `#FF6B6B` | Log out, unread message badge |
| `--on-color` | `#111111` | `#111111` | Text on any saturated fill |
| `--nb-link` | `#1D5FC4` | `#8FB8FF` | Blue text, such as links and mentions |
| `--nb-accent-text` | `#6B2FD9` | `#D9B8FF` | Purple text |
| `--nb-danger-text` | `#C62828` | `#FF9A9A` | Error and warning text |
| `--nb-border-color` | `#000000` | `#FFF1DC` | Outlines |
| `--nb-shadow-color` | `#000000` | `#FFD43B` | Shadows |

Text never sits directly on the saturated fills. It uses `--on-color` (dark) there, and colored text uses the `-text` variants, which pass 4.5:1 on cards. Dark mode is "true black": a deep neutral black page with warm cream text and outlines, taken from the logo's sticker plate, and a thin brand-yellow hard shadow. Dark-mode shadows are smaller than light-mode ones (4px default, 3px small, 5px large, 1px pressed) so the yellow doesn't overwhelm the page. Both themes set `color-scheme`, so native scrollbars, autofill and form controls match.

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
| Shadow small / default | `4px 4px 0` / `6px 6px 0` (dark: `3px` / `4px`) |
| Shadow large and hover | `8px 8px 0` |
| Shadow pressed | `2px 2px 0` |
| Press motion | 150–200ms with an overshoot curve, `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Reduced motion | Entrances become plain fades, press feedback uses the shadow only, and the loader pulses in place |

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

Logo, then **EchoLink**, **EchoShout**, **EchoMumble** and **Profile**, then the theme switch and your avatar, which links to Edit Profile. Each area has its own active color: yellow for EchoLink, blue for EchoShout and purple for Profile. EchoMumble opens a dialog instead of a page, so it has no active state.

### Mobile navigation (under 768px)

The links move to a fixed bottom bar with the same names: **EchoLink**, **EchoShout**, **EchoMumble** and **Profile**. The bar adds the device's safe-area inset at the bottom. The header keeps the logo, theme switch and avatar. CSS and JavaScript both switch layouts at 768px.

### Badges

| Location | Color | Counts |
|---|---|---|
| EchoLink / Chats | Red | Conversations with unread messages |
| EchoMumble / Mumbles | Purple | Unread Mumbles |
| Profile | Orange | Pending friend requests |

Each badge has screen-reader text, such as "3 pending friend requests", and its number is set at 12px.

### Responsive behavior

| Screen | Mobile | Tablet and desktop |
|---|---|---|
| Chat | List and conversation are separate views, with a back arrow | List beside conversation; list is 4 of 12 columns, then 3 on large screens |
| Profile | Sidebar stacks above content, links wrap | 240px sticky sidebar |
| Card grids | 1 column | 2–3 columns |

---

## Screens

### Sign in (`/`)

Built from the two logos, which load through Cloudinary's `e_trim` so their empty margins don't shrink them.

- **Wide screens (1024px and up):** two columns. On the left: the EchoRealm wordmark as a tilted sticker, which is the page's `h1`; the headline "Chat close. Shout loud. Mumble quietly.", with each key word on its product color; and a sample chat. The sample shows a yellow EchoLink bubble, a blue EchoShout bubble and a purple EchoMumble bubble, then a green typing bubble taken from the logo. On the right: the sign-in card.
- **Phones and tablets:** the wordmark and three colored chips sit above the card.
- **Bubble mark:** perched on the card's top-right corner at every size. It drops in once, then bobs slowly.
- **Background:** a faded dot grid with the logo's yellow sparkles twinkling and its "shout" lines at the edges. All of it is hidden from screen readers.
- **Card:** a yellow pill slides between **Register** and **Log In**, with Log In as the default. Below them are a heading ("Welcome back" or "Join the realm") and the form. Under the card, a link switches to the other mode.
- **Submitting:** the form stays on screen. The fields lock, and the submit button stays pressed in, with hazard stripes running across it and three outlined blocks hopping beside "Logging you in" or "Creating your account". The button keeps that state through the redirect after a successful sign-in. Errors appear inside the card, and only the password is cleared.
- **Reduced motion:** the entrances become fades, and the bobbing, twinkling and typing dots stop.

### Chat list (`/links`)

A search box and a create-group button sit above conversations, each showing avatar, name and a preview cut to 30 characters. Unread rows have bold preview text and a dot that screen readers announce as "Unread messages". On desktop, the right side shows a prompt until you choose a chat. The empty state reads "No chats yet. Add a friend to get started." and links to Find Users. If the list fails to load, an inline error with **Try again** appears in its place.

### Conversation (`/links/[id]`)

- A header card with avatar, name, and a three-dot menu
- Bubbles with hard shadows: yours are yellow on the right, theirs are card-colored on the left, with a relative time under each
- A composer with an attach button, text field, character counter and send button

### EchoShout (`/shout`)

A centered 896px column with one history panel. Bubbles show `@username` above and the time below, and mentions appear in blue before the text. Typing `@` at the start of a word, or pressing the **@** button, opens a floating user search. Chosen mentions appear as removable chips above the composer, next to a "Posting as" line. Skeleton bubbles appear while loading.

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
| **Feedback** | Toasts for the result of actions; inline errors with **Try again** when a list fails to load |
| **Signing in** | Pressed-in button with moving stripes and hopping blocks; with reduced motion, the stripes stop and the blocks blink |
| **Sending** | Enter sends; the send button shows a spinner. If sending fails, the text and attachment come back with an inline error |
| **Character limit** | Counter turns red past 55 and send disables |
| **Search** | Results appear after a 400ms pause |
| **Attachments** | Green dot on the paperclip; the placeholder shows the file name |
| **Scrolling** | Jumps to the newest message; scrolling to the top of EchoShout loads older posts |
| **Destructive actions** | Confirmation dialogs that say who is affected: clearing or deleting chats, leaving groups, unfriending, blocking, deleting Mumbles and Account Settings actions |
| **Theme** | Dark by default, saved per browser |

---

## Quality audit

Scored with Impeccable's technical audit, which rates five areas from 0 to 4. The rendered check ran on the sign-in page at 1280×800 and 390×844. The signed-in screens need an account, so they were audited from source.

### Score

| # | Area | Before | After | What decided it |
|---|---|---|---|---|
| 1 | Accessibility | 3 | 3 | Placeholder contrast, reduced motion, badge size and the unread dot are fixed. Signed-in screens still haven't had a rendered contrast and keyboard check |
| 2 | Performance | 3 | 3 | Chat images now lazy-load. The full-page loader and per-message animations remain |
| 3 | Theming | 4 | 4 | All colors go through tokens, with no raw palette classes or hex values |
| 4 | Responsive | 3 | 3 | `dvh` heights and safe-area padding work. Signed-in screens weren't checked at phone width |
| 5 | Implementation integrity | 3 | 4 | Failed loads now look different from empty lists; mentions work from the keyboard |
| | **Total** | **16/20** | **17/20** | **Good** |

The detector found **0 anti-patterns** on the rendered sign-in page at both sizes, both before and after the fixes. Before the fixes it raised one real advisory, 4.2:1 placeholder contrast, which is now fixed. The remaining advisories are the intentional hard shadows and overshoot easing.

### Fixed in this pass

| Problem | Fix | Files |
|---|---|---|
| Placeholders at 4.2:1 contrast, under the 4.5:1 minimum | Full `--muted-foreground` on placeholders, about 7:1 | `components/ui/input.tsx`, `AddToGroupDialog.tsx` |
| Reduced motion killed every animation at once, including loading feedback | Fades instead of movement, shadow-only press feedback, and a pulsing loader | `app/globals.css` |
| Badge numbers at 11px | 12px | `components/CountBadge.tsx` |
| A failed load of chats, friends, requests or blocked users looked like an empty list | New `LoadError` panel with **Try again**, shown instead of the empty state | `components/LoadError.tsx`, `ChatRooms.tsx`, `friends/list`, `friends/requests`, `blocked-users` |
| Empty-state text on Requests and Blocked Users at 12px in muted gray | 14px, with a bold heading line | `friends/requests`, `blocked-users` |
| The unread dot in the chat list was silent for screen readers | Announced as "Unread messages" | `ChatRooms.tsx` |
| Typing `@` in EchoShout did nothing | Opens the mention search; the placeholder mentions it | `components/MessageBar.tsx`, `shout/page.tsx` |
| Chat images loaded eagerly and zoomed on hover even with reduced motion | `loading="lazy"`; zoom only with `motion-safe` | `ChatBox/MessageBubble.tsx` |

### Dark theme rework

The old dark theme used Material Design's neutral gray (`#121212` page, `#1E1E1E` cards). Cards barely separated from the page (1.12:1), stark white outlines did all the work, and shadows were a muddy gray (`#5F5F5F`). It read as a white wireframe and didn't match the warm, colorful brand. It now uses deep black, cream outlines and text, and a thin yellow shadow. Every text token passes 4.5:1 on the page, card and muted surfaces (secondary text is the lowest at 7.1:1). The destructive toast and the online badge now use dark text on color instead of white, which failed contrast.

### Already fixed before this pass

The earlier audit's issues were found resolved in the code at commit `2a7868b`:

- **Mixed visual systems, invisible light-mode text, nonexistent color classes (1–3):** no `zinc`, `indigo` or `rose` classes remain.
- **Tiny text (4):** no `text-[9px]` or `text-[10px]` remain.
- **Unconfirmed destructive actions (5):** Clear Chat, Delete ChatRoom, Block, Unfriend and Mumble deletion use `ConfirmDialog`, and each explains who is affected.
- **Keyboard and screen readers (6):** rows and results are buttons, icon buttons have labels, labels use `htmlFor`, badges have screen-reader text, and messages sit in an `aria-live` log.
- **Contrast pairs (7):** text on colored fills uses dark `--on-color`, and blue, purple and red text use the darker `-text` tokens.
- **Sign-in form loss (9):** the form stays, errors show inside the card, and only the password is cleared.
- **Silent send failures (10, partly):** the composer restores unsent text and shows an inline error. This pass finished the list-load half.
- **Navigation labels (11):** desktop and mobile use the same names, the avatar goes to Edit Profile on both, and both breakpoints are 768px.
- **Profile layout (12):** Send Mumble shows alongside the featured Mumble, and the empty email line is gone.
- **Mobile chat height (13):** `dvh` heights and a defined `pb-safe` with `env(safe-area-inset-bottom)`.
- **Composer nesting (14), copy (16), Find Users pre-fill (17), removable mention chips (18), hidden scrollbars (19):** all resolved; lists now show a thin themed scrollbar.

### Still open

| Priority | Issue | Why it's open |
|---|---|---|
| P2 | Rendered audit of signed-in screens | The detector needs a logged-in session. Run `impeccable detect http://localhost:3000/links` with a signed-in browser, at desktop and 390px width |
| P2 | 55-character limit on private chats | The same limit applies to chats and Mumbles. Raising it for chats is a product decision and likely needs a server change, which is outside this client-only pass |
| P3 | Mention search can't be closed with Escape | It closes when you toggle the **@** button or pick someone |
| P3 | Full-page bouncing loader | Skeletons would show the layout sooner on page loads, as the lists already do |

### Next steps

1. Run the rendered audit on the signed-in screens, then fix what it finds for contrast and touch targets.
2. Decide the chat character limit with the server owner.
3. Finish with a polish pass: Escape handling in the mention popover, and skeletons in place of the page loader.
