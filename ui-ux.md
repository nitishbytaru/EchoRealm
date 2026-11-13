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

- 2px outlines on cards, buttons and inputs, in a soft charcoal (light) or warm gray (dark) rather than pure black or white; dividers inside panels use a faint line
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
| `--background` | `#F2EADB` | `#0B0B0B` | Page |
| `--card` | `#FFFCF5` | `#171717` | Panels |
| `--foreground` | `#111111` | `#FFF6E8` | Text |
| `--muted` | `#E6DCCB` | `#232323` | Quiet surfaces, hover |
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
| `--nb-border-color` | `#3A3632` | `#9C9488` | Outlines |
| `--nb-line` | outline at 22% | outline at 28% | Faint dividers inside panels: chat headers, composer strip, dialog footers |
| `--nb-shadow-color` | `#000000` | `#FFD43B` | Shadows |

Text never sits directly on the saturated fills. It uses `--on-color` (dark) there, and colored text uses the `-text` variants, which pass 4.5:1 on cards. Light mode is "paper": a warm paper page with off-white cards, so white never fills the screen and the brand colors read as stickers on paper. Dark mode is "true black": a deep neutral black page with warm cream text and warm gray outlines, taken from the logo's sticker plate, and a thin brand-yellow hard shadow. Dark-mode shadows are smaller than light-mode ones (4px default, 3px small, 5px large, 1px pressed) so the yellow doesn't overwhelm the page. Both themes set `color-scheme`, so native scrollbars, autofill and form controls match.

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
| Border | 2px everywhere; inner dividers use the faint `--nb-line`; the keyboard focus ring stays 3px |
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

A sticky 64px header sits above a content area capped at 1280px. Every signed-in page sits on the same faint dot grid as the sign-in page. Full-height screens (chats, EchoShout) use one shared `.h-app` height, worked out from the `--app-chrome` variable in `globals.css`, so their composers stay on screen. Page changes use the `fade-in-up` animation.

### Desktop header (768px and up)

- **Left:** the EchoRealm wordmark, slightly tilted (it straightens on hover), linking to EchoLink.
- **Center, the sticker dock:** one filled track (no outline) with **EchoLink**, **EchoShout** and **EchoMumble**. A pill in the section's color (yellow, blue or purple) slides to the active one. On Profile pages, no pill shows.
- **Right:** only your avatar, as a round sticker with the pending-request badge. It tilts slightly on hover and gets a purple ring while its menu is open or you're on Profile. The menu shows your name and email, then My profile, Pinned Mumbles, Friends (with a "new" count for requests), Find people, Settings, a **Dark mode** row with a toggle (it switches the theme without closing the menu), then **Log out**.

There is no separate Profile tab; the avatar menu replaces it.

### Mobile navigation (under 768px)

The header keeps the wordmark and a small sun/moon button for the theme, since phones don't show the account menu. A fixed bottom dock holds **Link**, **Shout**, **Mumble** and **Me**. Me is your avatar and opens Profile. The active item gets a tile in its section color. The dock adds the device's safe-area inset. CSS and JavaScript both switch layouts at 768px.

### Badges

| Location | Color | Counts |
|---|---|---|
| EchoLink | Red | Conversations with unread messages |
| EchoMumble | Purple | Unread Mumbles |
| Avatar menu / Me | Orange | Pending friend requests |

Each badge has screen-reader text, such as "3 pending friend requests", and its number is set at 12px.

### Responsive behavior

| Screen | Mobile | Tablet and desktop |
|---|---|---|
| Chat | List and conversation are separate views, with a back arrow | List beside conversation; list is 4 of 12 columns, then 3 on large screens |
| Profile | Member card stacks; section tabs scroll sideways | Member card banner with tabs in one row |
| EchoShout | Feed only | Feed plus a right rail |
| EchoMumble | Compact panel above the content | Sticky "Mumble HQ" panel beside the content |
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

- **Header:** "Your **chats.**" with a conversation count and a red unread count, and one yellow **+** sticker that opens a menu (New chat, New group); its + turns into an × while open.
- **Search:** a round search button sits to the left of the filter switch. Hovering it, clicking it or typing unrolls it left to right over the filters into a full search field; it stays open while it has text or focus, and folds back about a quarter-second after the pointer leaves. Escape clears it and closes it. Results drop down below.
- **Filters:** All, Unread (with a red count) and Groups as a segmented switch with a sliding pill.
- **Rows:**
  - an avatar in a brand color, with a green group badge for group chats;
  - the name and the time of the last message (a time for today, a weekday this week, a date before that);
  - a preview starting with "You:" when you sent the last message.
  - Unread chats are outlined, with bold text and a blue **New** sticker. The open chat is a yellow sticker.
- **States:** skeleton rows while loading, an inline **Try again** if the list fails, and "You're all caught up" or "No group chats yet" for empty filters.
- **Before you pick a chat (desktop):** the right side shows the bubble mark with a typing bubble, "Pick a **chat.**", and **Find friends** and **Shout to everyone** buttons.
- **Layout:** the list column is a fixed 19–22rem; the conversation takes the rest.

### Conversation (`/links/[id]`)

- A header with the person's avatar in their color ring and their @name (both open their profile; the avatar tips on hover), then a purple **Send a Mumble** button and the ⋮ menu. No subtitle.
- Messages sit on a faint dot grid and use the shared message layout (see Interaction patterns). Group chats show each sender's avatar and name; one-to-one chats don't.
- The composer (attach, text field, character counter, send) stays pinned to the bottom.

### EchoShout (`/shout`)

- **Header:** "Everyone hears **this.**", with "this." on a blue sticker. It sits in the right rail on desktop, so the feed takes the full height.
- **Feed:** one outlined card whose log scrolls on its own, while the composer stays pinned to the card's bottom edge.
  - Posts use the shared message layout (see Interaction patterns): yours on the right in yellow, others on the left with an initial avatar and @name.
  - Mentions show in blue.
- **Composer:** typing `@` at the start of a word opens a "Mention someone" search above the composer. Close it with its × button or Escape. There is no separate @ button. Chosen mentions appear as removable chips above the input. Left of the paperclip, a small identity button shows your avatar (or a mask when posting anonymously). Hovering or focusing it wipes a card open from left to right reading "Posting as @you" and "Click to change in your profile"; clicking opens Edit Profile. With reduced motion, the card just fades in.
- **Right rail (1024px and up):** the page title "Everyone hears **this.**" with its one-line description sits at the top (on phones it stays above the feed instead), then a blue "How shouting works" card (who sees shouts, the 55-character limit, mentions, images), then "Loud **lately**": the last five people who shouted, each with an initial chip and how long ago, built from the loaded messages and hidden when the feed is empty. The logo's typing bubbles and sparkles sit below.
- **First load:** ghost messages laid out like the real feed (dashed outlines, an avatar and name on the left, yellow-tinted bubbles on the right) slide in one after another with a soft shimmer, above the logo's typing bubble and "Tuning in to the room…". Screen readers hear "Loading EchoShout". With reduced motion, the ghosts just fade in and the shimmer stops.

### EchoMumble (`/mumbles/*`)

Mumbles are treated as small paper notes.

- **Mumble HQ panel:** sticky on the left from 1024px; on phones it sits above the content with a shorter header band.
  - **Header band:** a light purple band on the dot grid with the **Mumble mark** (a purple whisper bubble in the logo's style, with three quiet dots and two curved whisper waves) and two sparkles.
  - **Title:** "Mumble **quietly.**" and a one-line description (hidden on phones).
  - **Stat tiles:** New, In inbox and Pinned (out of 4). Each is a slightly tilted sticker with a colored icon. They show only once there are Mumbles to count.
  - **Switch:** Inbox / Send, with a sliding purple pill.
  - **Note:** anonymous Mumbles show as "Anonymous", with a dashed outline.
  - **On load:** the bubble pops in, the whisper waves draw themselves, the dots start breathing, and the stat tiles drop in one by one.
  - **On hover:** hovering the card makes the bubble wiggle and the waves ripple outward; hovering a tile lifts and straightens it, and its icon tips. With reduced motion, all of this is off.
- **Inbox:** notes in a masonry grid with one to three columns. Each note is tilted slightly and straightens and lifts when hovered.
  - Header: the sender's profile picture, shown large (48px), with their @handle and a compact time ("20m ago", "5h ago", "3d ago"). Mumbles don't include the sender's picture, so the client looks each sender up once with `searchUserByIdApi` and caches it (`hooks/useUserAvatars.ts`); an initial shows only when someone has no picture. Anonymous Mumbles show a dashed-outline avatar with a disguise (hat and glasses) icon and the name "Anonymous". The menu sits on the right.
  - New notes are purple with a tilted yellow **NEW** stamp on the corner. Read notes are card-colored, with faint ruled lines under the text like notebook paper.
  - Anonymous notes have a dashed outline and read "Anonymous".
  - Pinned notes have a drawn pushpin (outlined round head with a highlight and hard shadow, in yellow, red or blue) pressed into the top edge. It wobbles when you hover the note. Pinned Mumbles on Profile use the same notes and pins.
  - **Pinning:** while the request saves, the pin hovers and bobs above the note over a pulsing landing shadow, with a small "Pinning…" sticker; once saved, it drops in with a little squash. **Unpinning** wiggles the pin as it lifts out, with "Unpinning…". The rest of the page stays usable, and a toast confirms the result. Every note reserves room for a pin at the top, so pinning never changes a card's height or shuffles the masonry columns, and the pin animates on its own base, so it stays centered from hover to settle.
  - Likes appear under the text when a note has any.
  - Actions (pin, message, delete, block) sit in each note's menu.
  - **First load:** the Mumble mark bobs while its dots breathe and its whisper waves ripple, above "Collecting your quiet notes…". The side card's stats stay hidden until there are Mumbles to count.
  - **Empty state:** a tilted dashed note, "It's quiet in here", with a **Send a Mumble** button.
- **Send:** "Send a **Mumble**" header, then one card in three labeled parts, each headed by a small colored icon tile, with dashed dividers between them. The live preview sits beside it on wide screens and below it on phones.
  - **To:** a large search field. Once you pick someone, they appear as a tilted sticker card with their picture, @handle and a **Change** button.
  - **From:** two choice cards, "As @you" (your picture) or "Anonymous" (dashed disguise avatar), each with a one-line hint. The chosen card turns purple with a yellow check sticker.
  - **Note:** a three-line ruled-paper field in the same bold type as the notes. It lifts when focused instead of drawing an outline, and stays dimmed until you pick a recipient. Below it, a purple progress bar fills toward the 55-character limit (red past it), next to a full **Send Mumble** button. Enter sends.

### Profile area

- **Member card:** an ID-badge layout.
  - **Photo panel** (left on wide screens, top on phones): purple, on the dot grid, with sparkles and the logo's yellow typing bubble. Your picture sits in it as a large tilted photo sticker that straightens on hover.
  - **Name:** your username in large bold type, with your email in a soft chip and two status chips from your settings: "Posting as you" or "Posting anonymously" (purple), and "Open to Mumbles" (green) or "Mumbles off".
  - **Stats:** three tilted stickers with colored icon tiles: Friends (blue, opens Friends), Likes (red) and Requests (orange, opens Requests). While the numbers load, each tile shows bouncing dots instead of a dash, then counts up to the real number (instantly with reduced motion). Tiles lift and straighten on hover.
  - **Actions:** Edit profile, Public view and a quieter **Log out** (reachable on phones too, where there's no avatar menu).
- **Section tabs (binder style):** the tabs sit directly on top of the content panel like the tabs of a ring binder.
  - Groups are marked by small tilted label stickers in their own color: **You** (yellow: Profile, Pinned), **People** (blue: Friends, Requests with a count, Find people, Blocked) and **Account** (purple: Settings).
  - The active tab is taller, joins the panel with no line between them, and carries a stripe in its group's color. Inactive tabs sit just behind the panel in a muted fill and rise a little on hover.
  - On phones the row scrolls sideways and centers the active tab automatically; it glides when you switch tabs and stops adjusting once you scroll it yourself.
- **Content:** a full-width panel. Every section uses the same header style as the rest of the app, with a key word on a sticker.

| Page | Contents |
|---|---|
| **Profile** | Photo panel on the left: your picture as a tilted polaroid on the purple dot grid, captioned with your @name, with a camera sticker, Change photo and Undo. A newly picked photo "develops" in, and a disguise sticker sits on it while anonymous mode is on. On the right, an **Account** card (username and email side by side, new password below) and a **Privacy** card with two toggle scenes (see Interaction patterns). A save bar with Discard and Save slides in only while there are unsaved changes |
| **Pinned** | Pinned notes (the same note style as the inbox) with like counts and Unpin |
| **Friends** | A count sticker and an instant filter box, then trading-card stickers: a band in the friend's own color on the dot grid, their avatar large and overlapping it, their @handle, and **Message**, **Mumble** (purple, opens Send Mumble to them) and a View-profile button, with Unfriend / Block in the corner menu. Cards pop in tilted one after another and settle; on hover a card lifts, straightens and its avatar hops. Shimmering ghost cards while loading, and an illustrated empty state with a Find people button |
| **Requests** | Same trading cards as Friends (shared `components/people/PersonCard.tsx`), with an orange "waiting" count, a "Wants to be friends" stamp, a View-profile button in the corner, and big **Accept** (green) / **Decline** buttons. **Accepting** stamps a green "Friends now! You and @name" panel over the card with a burst of the logo's sparkles, then the card leaves. **Declining** slams a red DECLINED stamp onto the card, which then crumples and drops away. Illustrated empty state with Find people |
| **Blocked** | Muted cards: a gray hazard-striped band, a red BLOCKED stamp, a faded grayscale avatar with a red no-entry sticker, a struck-through @name, "Can't message, Mumble or find you", and **Unblock**; unblocking tips the card out of the grid. Empty state: "Nobody's blocked" with a green shield |
| **Find people** | A large search box (Escape clears it). Results use the same cards with a relationship stamp that pops in: FRIENDS (green, with Message), REQUEST SENT (orange, "Waiting for a reply"), or nothing and a blue **Add friend** button that shows a spinner while sending. Illustrated prompt before you search and a "No one by that name" state |
| **Settings** | Deliberately sober: no stickers, tilts or playful color, with red only where something is at stake. A plain title, then a red-tinted notice that everything here is permanent and may affect other people's accounts. **Delete your data** is one outlined list of four rows (private chats, received Mumbles, sent Mumbles, EchoShout posts); each row has a neutral icon, what gets deleted, an **Affects:** line (red when it reaches other people, gray when only you), and a red-outlined delete button. **Delete your account** is a separate red-bordered section listing what you'll lose, with a solid red button; it requires typing your username. Every action asks for confirmation. Log out lives on the profile card and in the avatar menu, not here |
| **User Profile** (`/profile/view/[id]`, "Public view") | Gets the full page, without your own member card and tabs above it. A Back button, then (on your own page) a note saying "This is how other people see your profile" with Edit profile. The hero is an ID badge in the person's color: their photo as a tilted polaroid captioned with their @name, a relationship stamp (Friends, Request sent or This is you), their name large, Friends and Likes stats that count up, and Message, Send a Mumble and (if you're not connected) Add friend. Below, **Most loved**: their most-liked Mumble as a large pinned note with a heart sticker. Then **Pinned Mumbles** as paper notes with a heart button that fills and pops when you like one. Opening a profile shows the app loader ("Opening profile") |

---

## Interaction patterns

| Pattern | How it behaves |
|---|---|
| **Page load** | The app loader (`components/Loading.tsx`): three outlined speech-bubble stickers in the section colors (yellow EchoLink, blue EchoShout, purple EchoMumble) jump, wiggle and "type" one after another in a 1.8s loop, above a "LOADING…" label whose dots count up. It's pure CSS, so it appears instantly. Used for the first app load, the sign-in check, and opening a chat ("Opening chat…"). With reduced motion, the bubbles hold still and the group gently pulses |
| **Entrances** | Nothing pops onto the screen. Each page's sections, cards, list rows and tabs rise in slightly and fade, one after another (60ms apart), using `.nb-stagger` on containers and `.nb-enter` for single elements in `globals.css`. Page content fades between routes. On first load, the navbar's wordmark, dock and avatar stagger in and the phone tab bar slides up. Only position and opacity animate, so tilts and hover lifts still work, and nothing stays hidden once the entrance ends. With reduced motion, everything just fades |
| **List load** | Skeleton cards that match the final layout |
| **Small waits** | Background work on a page that's already showing (refreshing a list you've seen, or saving an action like delete, block, unfriend or accept) shows an "Updating…" sticker with the logo's bouncing yellow dots at the right of the section header (`components/BusyBadge.tsx`). It's on the Mumble inbox and Profile's Pinned, Friends, Requests and Blocked pages. Composers show a spinner in the send button |
| **Feedback** | Toasts for the result of actions; inline errors with **Try again** when a list fails to load |
| **Composer** | One outlined sticker bar shared by EchoShout and EchoLink, on a muted strip. Inside: the identity button (EchoShout only), the paperclip (turns green once an image is attached), a borderless text field, a counter from 40 characters (red past 55), and a yellow send sticker that stays muted until there's something to send. While you type, the bar lifts with a bigger hard shadow instead of drawing a focus box around the field. An attached image shows as a thumbnail chip above the bar, with its name and a remove button |
| **Messages** | One layout for EchoShout and EchoLink (`components/chat/ChatMessage.tsx`). Bubbles have a 2px outline, a small hard shadow and 15px text. Messages from the same person within 5 minutes stack tightly; the avatar and @name show once per run, and the time (HH:mm) sits inside the last bubble's corner. A small sticker such as "Today", "Yesterday" or "Tue 11 Nov" separates days. Hovering a time shows the full date |
| **Usernames** | Every @username uses one plain handle style (`components/Handle.tsx`): a soft gray "@" followed by the name in bold, sized for each place (tiny above chat bubbles, up to large on the Profile banner) |
| **Privacy toggles** | Sticker switches (`components/StickerSwitch.tsx`): a chunky pill whose knob is a small sticker carrying an icon; it bounces across, and the icon spins in. Each toggle sits in a scene that shows what it does. **Become anonymous:** a disguise (hat and glasses) drops onto your avatar, and the line changes from "Seen as @you" to "Seen as Anonymous". **Accept Mumbles:** a purple note flies into an open green mailbox ("Your inbox is open"), or a red CLOSED sign swings onto it ("Your inbox is closed"). Each card tints to match its state |
| **Menus** | Every three-dot and avatar menu shares one style. Menus open on hover (after about 0.12s) as well as on click or tap, and stay open while the pointer moves into them; they close about 0.2s after it leaves. A menu pops out of its button with a slight overshoot, and its items slide in one after another; it closes instantly, so a closing menu never lingers over or below the content behind it. Each item's icon sits in a small outlined tile; hovering tints the item and nudges it right. Destructive items have red-tinted tiles and sit below a divider. Menus can open with a small header, such as "From @maya" or "From Anonymous" on a Mumble. While a menu is open, its button stays pressed: three dots turn sideways and the avatar chevron flips. With reduced motion, menus just appear |
| **Badges** | On desktop, unread counts sit inline after the section label in the navbar dock, as small outlined count stickers, so they look right whether or not that section's pill is under them. On phones they stay on the icon's corner |
| **Toasts** | Sticker cards in the bottom-right corner, or along the top on phones. A tilted badge shows the type: green check "Done!", red warning "That didn't work", yellow bell for anything else. The toast slams in with a slight overshoot, the badge pops in, and error badges shake once. A colored countdown strip runs along the bottom and pauses with the timer on hover or focus. Errors stay 6s and others 4s. Dismissing flicks the toast away, and an identical toast that's already showing isn't added again. With reduced motion, toasts just fade |
| **Signing in** | Pressed-in button with moving stripes and hopping blocks; with reduced motion, the stripes stop and the blocks blink |
| **Sending** | Enter sends; the send button shows a spinner. If sending fails, the text and attachment come back with an inline error |
| **Character limit** | Counter turns red past 55 and send disables |
| **Search** | Results appear after a 400ms pause |
| **Attachments** | Green dot on the paperclip; the placeholder shows the file name |
| **Scrolling** | Jumps to the newest message. Scrolling to the top of EchoShout or a conversation loads older messages; while they load, a small outlined pill with the logo's yellow typing dots sits pinned at the top of the log ("Digging up older shouts…" or "Loading earlier messages…") |
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

### Light theme glare

The light page was near-white cream (`#FFF9F0`) with pure white cards, so bright white filled most of the screen and washed out the pastel brand colors. The page is now warm paper (`#F2EADB`) with off-white cards (`#FFFCF5`) and a deeper muted tone (`#E6DCCB`). Secondary text stays above 4.5:1 everywhere (lowest: 5.2:1 on muted).

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
