# SoloDev Studio 2.2.8
<img width="1274" height="1050" alt="{8BE7BB76-5FB8-4CF2-9469-8310FF1F0785}" src="https://github.com/user-attachments/assets/cf4d6cd0-68c7-4570-8b46-b2ad01d06263" />

**Plan your game. Design it. Check the market. Tell people about it.**

A companion app for one person making games. It works completely offline, keeps
everything on your own device, and has no accounts, no ads and no telemetry. 
Available on Windows and Android


---

## What's here

| File | What it is |
| --- | --- |
| `SoloDevStudio-2.2.8-portable.exe` | Windows app. No install — double-click to run. |
| `SoloDevStudio-2.2.8.apk` | Android app. Sideload it (you will need to allow "Install unknown apps"). |
| `app/` | The full web app source. It also runs in any browser — just open `app/index.html`. |
| `desktop-src/` | Electron wrapper source. Rebuild the EXE from here. |
| `mobile-src/` | Capacitor Android project. Rebuild the APK from here (the signing key is included). |
| `README.md` | This file. |

---

## What is new in 2.2.8

**The starter list no longer counts as your research.** On **Market → Overview**,
"Similar games tracked" was showing 8 — the number of games in the built-in
starter list — even when you had not added a single one yourself. The middle
price and middle review count were worked out from that list too, so the page
looked like it had done research you had not done.

The starter list is reference material. It is now treated as exactly that:

- "Similar games tracked" counts only games **you** added
- The middle price and middle review count use only your games, and show a dash
  when there are none
- The "should you commit to this?" scorecard follows the same rule, so the price
  check cannot pass on borrowed numbers
- The **Price** tab compares your price against your own comparables only
- With nothing added, the page says so plainly and points you at the Similar
  games tab

Adding a game from the starter list is still one click — and once added, it
counts as yours, because you chose it.

---

## What is new in 2.2.7

**A bug in the code that builds every screen, which had been silently throwing
away inline styling.** About 290 places in the app set styling directly on an
element — widths, spacing, colours, alignments. None of them had ever taken
effect.

The cause: the helper that creates elements passed each style name straight to
the browser, but the browser only understands CSS names. Asked for `minWidth` it
recognises nothing, so it discarded the entry without complaint. Any style
written in that form — `marginBottom`, `backgroundColor`, `fontSize` and so on —
was quietly ignored.

Most of it was cosmetic and went unnoticed. One instance mattered a great deal:
the discount ladder table on **Toolbox → Money** asked to be allowed to shrink,
was refused, and stayed 560 pixels wide inside a 350-pixel screen. That pushed
the whole page wider than the phone.

On Android a page wider than the screen makes the browser zoom out to fit, and
everything sized to the viewport — including the bottom bar — stretches with it.
That is why the bottom bar looked wrong with only some of its buttons visible,
and why the interface stopped scaling properly afterwards.

The helper now translates style names correctly, the app picks up the styling it
always intended to have, and nothing overflows at any width.

**Turning the phone is handled properly.** Rotating now recognises that the
orientation changed, redraws the current screen, and re-fits anything measured in
code — so the layout is correct in portrait, landscape, and back again.

**The page can no longer be zoomed by accident.** Pinching to zoom used to be
able to leave the interface stuck at an odd scale. The app controls its own
scale; text size still follows your system setting.

All of this is covered by tests now: the overflow check runs across all five
Toolbox groups at phone width with the Android layout active, and a rotation
test measures portrait, landscape and portrait again.

---

## What is new in 2.2.6

**Opening the menu on a narrow window blurred the whole app with nothing left
sharp.** The slide-out drawer was opening *behind* its own dimming layer.

When you narrow the window, the navigation moves into a drawer that slides in
over the page, with a dimmed layer behind it. Both are stacked by number — the
drawer at 100, the dim layer at 99 — but the drawer sat inside a shell element
that had a stacking number of its own. That starts a fresh stacking context, so
the drawer's 100 only counted *inside* the shell, while the dim layer sat outside
it at 99 and therefore painted over everything, drawer included. The result was
a blurred page with the menu hidden underneath.

The dim layer now lives in the same stacking context as the drawer it belongs
behind, so the drawer sits on top where it should.

A test now opens the drawer for real, clicks the middle of it, and checks that
the click lands on the drawer and not on the dimming layer — then clicks the
dimming layer and checks the drawer closes.

---

## What was new in 2.2.5

**Pressing a button stretched it.** On the Learn pages, holding down a section
chip made it bulge — sometimes into a large oval.

It was the little ripple effect that plays when you press something. The ripple
is a small circle inserted into the element on press, and it relies on being
positioned absolutely inside its host. But its styling was written as
`.btn .ripple`, so it only applied inside buttons. Chips and the top-bar icon
buttons also receive a ripple, and on those the span had no styling at all — so
it stopped being an invisible overlay and became a real box the size of the
ripple, pushing the control out of shape.

Two things now prevent it: the ripple is styled wherever it appears, and every
control that can receive one is a proper positioning context that clips it.
The code also forces this at press time, so the same mistake cannot reappear.

This is why it only happened on press and hold. A test now presses a chip, a
button and an icon for real — through the same input path the app uses — and
fails if any of them changes size. They measure identical before, during and
after.

---

## What was new in 2.2.4

**On a phone, the Design page's section menu covered the page you were reading.**
It sits in a column beside the form on a desktop and sticks to the top as you
scroll. On a phone it becomes a single column, so the menu ends up above the
form — but it was still sticking, pinning it over the form as soon as you
scrolled. It is now a wrapping row of chips above the form.

**The Learn section chips are locked to their proper size** — never stretched,
wrapped or shrunk, with a test that fails if any chip exceeds 60 pixels tall.

---

## What was new in 2.2.3

**Moodboard pictures now survive closing the app.** They were stored correctly
all along, but the tile was remembering the address it resolved for itself by
writing it onto the tile object — which is saved to disk. Those addresses only
work inside the session that made them.

**The viewer was showing a stretched copy of the picture.** Zooming scaled the
element with a CSS transform, so the browser drew the picture once at fitted
size and blew that drawing up. It is now resized properly, so full-resolution
sources stay sharp at any zoom.

---

## What was new in 2.2.2

**"Choose from this device" did nothing** — the button was disabled from the
moment the page loaded, because `disabled: 0` was written as `disabled="0"`,
which still disables a button.

**"Delete everything" did nothing** — and neither did any other confirmation.
Every dialog was silently answering "no".

**Pinning a tile jumped the page to the top** — any redraw reset the scroll.

---

## What was new in 2.2.1

**Learn and Vault are on the bottom bar.** All eight sections share it equally.

**The mobile layout overflowed sideways, which hid content.** Calculator results
were pushed off the right edge, so you saw the row labels with no numbers. A
grid track written as `1fr` is really `minmax(auto, 1fr)`, and when the content
wants more room than the container the track grows past it. Every grid now uses
`minmax(0, 1fr)`.

**Also on phones:** solid top and bottom bars, the bottom bar clears the Android
navigation buttons, and the Toolbox tab strip wraps instead of being clipped.

---

## What was new in 2.2

**Moodboard images are stored at full size — no cap at all.** The original is
kept exactly as it came off your disk: original resolution, original quality, no
resizing and no re-compressing.

There was a real reason for the old 1600-pixel limit. Images used to be embedded
in the app's settings file, which browsers cap at about 5 MB — one photo would
have broken every save. They now live in a proper on-device media store
(IndexedDB), which has no practical limit.

---

## What was new in 2.1

### 2.1.2

The first card in a row of three on the **Learn** pages was stretching to fill
the screen and covering the text around it — a CSS class name clash between the
image viewer and the "Label B" card badge.

### 2.1.1

Removed the search field from the top bar.

### 2.1.0

**The app is smooth.** The previous build drew everything with the processor
instead of the graphics chip. On the busiest screen:

| | Before | After |
| --- | --- | --- |
| Frame time | 158 ms | **8.3 ms** |
| Frame rate | 6 fps | **120 fps** |

Graphics acceleration is on by default, with an automatic software fallback if
the driver misbehaves. You can also switch it in **Vault → Settings →
Smoothness**.

**A moodboard inside the Design pages,** with reference images you can pin from
your device, plus colours, gradients and notes — and a full-screen viewer with
wheel, button and pinch zoom, drag to pan, and arrow keys to move between
references.

Everything else from 2.0 is still here: the planner with its drag-and-drop task
board, the twelve-part design document, market research, the six-phase marketing
campaign, thirteen calculators and the three plain-language guides.

---

## What was new in 2.0

A full rebuild, not a reskin.

**A new look, and it moves.** Dark by default, with light and paper themes.
Smooth transitions between screens, animated charts, progress rings that fill,
confetti when you finish a step, drag-and-drop task boards, and a proper mobile
layout with a bottom tab bar.

**Plain English everywhere.** The old version was written like a strategy
document. This one is written like a person explaining something. Every piece of
jargon has a plain-English entry in the Vault glossary.

### Two sections that did not exist before

**Market** — is there actually an audience for this?
- Track the 8–15 games you would be compared to
- Estimate their sales from review counts
- See how concentrated the market is (do three games take everything?)
- Check whether your tags have players in them
- See where your price sits against every comparable
- Record wishlist numbers weekly and watch the trend, with a warning when you
  are below the level where the platform will show you to anyone
- A six-point "should I commit to this?" checklist

**Marketing** — how to get people to play it
- A six-phase campaign from a year out to a month after launch, with every task
  written for you
- A content calendar with twelve ready-made post ideas
- A press and creator outreach tracker, with the email template that works
- A budget tracker and an honest advertising return calculator
- A store page copy builder with a live character counter
- The full launch asset checklist and an hour-by-hour launch runbook

### Plan got a lot bigger
- Tasks live on a drag-and-drop board (To do / Doing / Done)
- Milestones with dates, late warnings, and starter sets per game type
- Ideas get parked instead of derailing you
- A weekly review box that saves itself
- The 14-day hours chart, the ceiling tracker and the release timeline

### Design got deeper
The design document is twelve parts, and every part explains what belongs there:
the pitch, three rules, core loops, numbers, game feel, world and characters,
art direction, moodboard, technical limits, balance, build plan, playtests and
the cut list.

### Toolbox went from 4 calculators to 13
Money: what you keep per sale, break-even, how long you can survive, and the
discount ladder. Time: will it fit, how long it will actually take, and which
features earn their place. Market: competitor sales, what to charge, wishlists
to sales, and tag crowding. Advertising: will it pay for itself, and the full
funnel from ad views to sales.

### Learn now has three guides, all rewritten
1. **Making games on your own without burning out**
2. **Making your Unity 6 game run fast** (plus the eight drop-in scripts)
3. **Getting people to actually play your game**

---

## Where to start

1. Open **Plan** and make your first project. It takes a minute.
2. Read the first guide — fifteen minutes, saves months.
3. Open **Design** and fill in the pitch. Everything else follows from it.
4. Come back to **Plan** every day and tick things off.
5. When you have something worth showing, open **Market** and then **Marketing**.

To see what a filled-in project looks like, open **Vault → Backups → Add the
example project**. It seeds a complete worked example: a design document, tasks,
milestones, market research, wishlist history, a moodboard and a marketing plan.

---

## Your data

Everything is stored locally — in local storage on the web and desktop builds,
and in app-private storage on Android. There is no cloud and no account.

**Save a backup from the Vault after every milestone.** One JSON file contains
every project, design document, task, moodboard, note and marketing plan. It
moves cleanly between the desktop and Android builds.

Data from version 1 is picked up and converted automatically the first time you
open 2.x.

---

## If the Windows app does not open

The build is hardened against the things that actually stop a portable Electron
app on Windows:

1. **Graphics drivers.** Acceleration is on by default because that is what
   makes the animations smooth. If the driver crashes, the app notices and
   switches itself to software rendering on the next launch. You do not have to
   do anything.
2. **Folder names Windows dislikes.** Data goes to `%APPDATA%\SoloDevStudio`.
   Never rename the file with a colon in it.
3. **OneDrive placeholders.** A 96 MB `.exe` that is only a cloud placeholder
   may not run. Keep it on a local drive, or right-click it and choose
   **Always keep on this device**.

If a double-click still does nothing:

- Right-click the file → **Properties** → tick **Unblock** → OK.
- If **SmartScreen** appears: **More info** → **Run anyway**. The file is
  unsigned, so this happens once.
- Keep the `.exe` ending.
- Check `%APPDATA%\SoloDevStudio\startup.log` — it is written on every launch,
  and its second line tells you whether hardware acceleration is on.

If the app ever looks like it is running slowly, check that second line. If it
says SOFTWARE, open **Vault → Settings → Smoothness** and press **Try hardware
again**. If it says HARDWARE and it still feels slow, turn on
**Reduce visual effects** in the same place — that drops the blurred translucent
bars and the drifting background, and nothing else.

To force software rendering from a shortcut, launch the app with
`--software-rendering`.

---

## Rebuilding from source

### Windows (Electron)

```text
cd desktop-src
npm install
npm run dist        # produces dist/SoloDevStudio-<version>-portable.exe
npm start           # or run live from source
npm run smoke       # headless test: renders every screen, reports errors
```

The smoke test renders all eight sections in both empty and filled states, every
design section, every calculator, the moodboard, and exercises the image viewer
(zoom, pan, next/previous, close). It exits non-zero if anything throws.

### Android (Capacitor + Gradle)

Needs **JDK 21** and the Android SDK (platform 36, build-tools 36.0.0).

```text
cd mobile-src
npm install
npx cap sync android
cd android
gradlew assembleRelease   # signed with the bundled keystore
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

- Keystore: `android/app/solodev-release.keystore`
- Alias and passwords: in `android/app/build.gradle`
- Change them and keep the keystore safe if you plan to publish updates.

### Web

Open `app/index.html` in any modern browser. No server needed.

---

## Honesty notes

- Revenue and sales calculators are **planning models built from historical
  ranges**, not promises. Every number is adjustable so you can run a
  pessimistic and an optimistic case.
- Review counts in the starter comparison list are approximate and change
  daily. Verify them live before betting a year on them.
- The three load-bearing ideas in this whole system are: **only one game in
  production at a time**, **always add 25% to every estimate**, and **finish the
  first game small**. If you ignore everything else in this app, keep those
  three.
- There is no AI in this app and it makes no network calls. Every number is
  either sourced or labelled as a model.
- Images you add to a moodboard are stored inside the app, so they count towards
  its storage. The board shows how much it is using. If it gets large, there is
  a button to remove the stored pictures while keeping your colours and notes.
