# SoloDev Toolbox 3.4.1
<img width="1274" height="1050" alt="{8BE7BB76-5FB8-4CF2-9469-8310FF1F0785}" src="https://github.com/user-attachments/assets/cf4d6cd0-68c7-4570-8b46-b2ad01d06263" />

**Plan the game. Then get better at everything it needs.**

Five tools for one person, all offline and all on your own device: **Studio**
for planning, designing, market research and launch; **Music**, **3DFoundry**,
**2DCanvas** and **Story** for the skills that make the work actually good —
plus **Pocket** versions of each for finishing something in a single day.

No accounts, no ads, no telemetry. Available on Windows and Android.

---

## What's here

| File | What it is |
| --- | --- |
| `SoloDevToolbox-3.4.1-portable.exe` | Windows app. No install — double-click to run. |
| `SoloDevToolbox-3.4.1.apk` | Android app. Sideload it (you will need to allow "Install unknown apps"). |
| `SoloDevToolbox-3.4.1-source.zip` | The full source for this release: the web app, the Electron wrapper and the Android project. No `node_modules`, build output or binaries. |
| `app/` | The full web app source. It also runs in any browser — just open `app/index.html`. |
| `app/assets/brand/` | The editable SVG logos: the Toolbox app icon plus each module mark. |
| `desktop-src/` | Electron wrapper source. Rebuild the EXE from here. |
| `desktop-src/tools/export-icons.js` | Regenerates every icon file from the SVGs. |
| `mobile-src/` | Capacitor Android project. Rebuild the APK from here (the signing key is included). |
| `README.md` | This file. |

---

## What is new in 3.4.1

**Fixed: the Vault is the same vault in every tool. Templates and the glossary
are no longer missing outside Studio.**

Only Studio's vault carried the Templates and Glossary tabs; opening the Vault
from Music, 3DFoundry, 2DCanvas, Story or any Pocket tool showed just Backups,
Notes, Sources and Settings — even though those tools' own Home cards describe
the vault as holding "reusable templates, a glossary and settings". Every tool
now shows the full set — Backups, Notes, Templates, Glossary, Sources and
Settings — with the same content as Studio's, and the "planning templates and
the glossary stay in Studio" note is gone with the missing tabs.

---

## What is new in 3.4.0

**Fixed: ticking a "done" control no longer reloads the page, and adding a card
to a card tool no longer makes the page jump.**

The exercise "Mark done" buttons on every tool's lesson pages (Music, 3D
Foundry, 2D Canvas, Story) re-rendered the whole page when they were clicked.
A route render replays the page entrance animation and rebuilds the screen, so
ticking one exercise read as the app reloading — and the recreation could move
the page scroll with it. The button now toggles in place: the card takes its
done styling, the label switches to "Done ✓" and the lesson-menu dot updates,
with no re-render and no scroll. The same in-place treatment went to the other
done controls that shared the bug: the marketing campaign's checklist items and
"Mark this phase finished", the content calendar's posted ticks, the Plan
milestones, and Home's "Do next" task checkbox (which also refreshes the
"Tasks done" meter beside it).

The card tools — Music's song map, 3D Foundry's sprint week, Story's scene
cards — rebuilt their whole card on every action (`App.clear(card)` and start
again). Adding the first card on a blank page emptied the card for a moment,
which makes the page shorter and lets the browser clamp the scroll, and it
removed the button the user had just clicked, which makes the browser scroll as
focus falls back. The card, the list host and the add form are now built once
and the parts that change are painted in place: the count, the graph, the strip
and the rows. Adding a card cannot move the page, and no route render is
involved.

Home's "Idea parking lot" no longer reloads the page either: parking, finishing
or deleting an idea repaints the badge and the list in place.

- The lesson menu's completion dot updates with the exercise that just changed,
  instead of waiting for the next navigation.
- A real click focuses the button it lands on; every one of these in-place
  repaints drops that focus before it removes the element, so the page cannot
  be scrolled by focus falling back.
- `INPLACE` in the smoke suite pins the whole set down: each tick and each add
  must not call `App.renderRoute` and must not scroll the page up.

---

## What is new in 3.3.9

**Fixed: adding a picture to a moodboard no longer moves the page — on any
board, including the tool design pages (3D Foundry, Music, 2DCanvas, Story)
where it was worst.**

3.3.7 put the empty-state panel below the grid and 3.3.8 moved the file picker
to the body, but the page could still move when a picture was added on a tool
design page. The mover was the "Ready to pin" tray: it sat inside the board
card, above the grid, so importing a file pushed the grid and the pin button
down by the tray's height, and pinning pulled them back up as the tray folded.
The browser's scroll anchoring turned that into a page scroll — the board and
everything under it ended around 190px higher than where the user was reading.

The tray now floats below the card (`position: absolute`, no layout) and fades
out on a pin instead of folding its height away. Showing it and retiring it
change nothing: the card, the pin button, the grid and the page scroll all stay
put, on Studio's project moodboard and on all four tool design moodboards.
"View the whole board" and "Clear moodboard" moved out of the controls' button
row to below the grid, where they appear at the first pin without wrapping the
row onto a second line on a phone (which had pushed the grid down).

The last mover was focus, and it was invisible to every geometry test because a
programmatic click never focuses anything. A real click focuses the button it
lands on — "Choose from this device" on the import, "+ Pin to board" on the pin
— and rebuilding the board's controls removed that focused element from the
DOM. The browser scrolls the page when focus has to fall back, once per
rebuild: that is why the page moved on the import *and* again on the pin. The
board now drops focus from anything inside it before it rebuilds, and the smoke
tests click the real way (focus first), so the whole flow is measured with a
focused button.

- The board switches the browser's scroll anchoring off for its own repaints
  and keeps holding its own anchor (`App.keepScroll`; the empty panel still
  leaves after the grid has painted), so the page cannot be scrolled by the
  browser to "compensate" for a pin.
- `PIN_STABLE` now requires the import itself to move nothing — card, card
  height, pin button, grid, scroll — and `FIRST_PIN` runs Studio's board and
  all four tool design boards, checking the geometry at the import, the instant
  the empty state leaves, and once the tray is gone.

---

## What is new in 3.3.8

**Fixed properly: the page could scroll up when you added a picture — most
often on the tool moodboards (Music, 3DFoundry, 2DCanvas, Story), which is why
Studio's board looked fine.**

Every board's "Choose from this device" button clicks an invisible file input
kept just outside the screen. That input was `position: fixed` *inside the
page* — but a fixed element is positioned against the nearest ancestor that
has a transform, and every page section keeps an identity transform after its
entrance animation. So the "off-screen" input was really sitting at the
top-left corner of whichever section contained it. When the WebView focused it
(tapping the button, or coming back from the picker) the page scrolled to that
spot. On a tool's design page the board is the section, so the board came up
under you; on Studio the section sits higher up the page, so the page could
jump to the top. It also depended on how far down you had scrolled.

All moodboards are one shared component (`App.moodBoard`) — Studio's project
moodboard and the built-in board of every design in every tool — and they now
share one file input attached to the document body, where `position: fixed`
really is the viewport corner. Focusing it cannot move the page, and the
2DCanvas value checker uses the same input. Together with 3.3.7's empty-state
fix, adding the first picture to any board leaves the card, the pin button and
the page scroll exactly where they were.

The smoke suite's new `PICKER_INPUT` check builds a fresh board on Studio and
on a tool design page, and fails if the picker input is inside the page, is not
at the viewport corner, or scrolls the page when it is focused.

---

## What is new in 3.3.7

**Fixed: the page no longer jumps when the first picture lands on a new
moodboard.** On an empty board the empty-state panel ("The board is empty…")
used to sit between the board's controls and the picture grid. Pinning the
first picture removed that panel, which pulled the grid — and everything below
it — up the height of the panel, and on a page scrolled down it could clamp the
page scroll, so the page scrolled up under you. It only happened on the first
pin, because after that the empty panel was already gone.

The panel now lives in the board's content slot, *below* the grid, so the
grid's place never changes when the first pin arrives: the tile appears where
the panel was and the panel drops out beneath it.

- The board card, the pin button and the grid return to their exact
  pre-import positions, and the page scroll does not change.
- The same fix covers every moodboard in the app — Studio's project moodboard
  and the built-in moodboard of every design in Music, 3DFoundry, 2DCanvas and
  Story — because they are one shared component.

The smoke suite's new `FIRST_PIN` check pins the first picture on a brand-new
board (Studio's and a design's) and fails if the grid moves the instant the
empty state leaves, if the page scroll changes, or if the card, pin button and
grid do not return to their pre-import places.

---

## What is new in 3.3.6

**The import tray now clears itself, and every board has a clear button.**

- **Previews clear the instant you pin.** The "pending" row folds away the
  moment the pin lands — no tick, no wait period — so the next import always
  starts from an empty tray. The fold is a short animation, not a snap, and
  the page never scrolls: the board card ends exactly the size it was before
  the import, with the new pin sitting on the board.
- **Clear previews.** A small link in the tray empties it on demand. Files
  that were never pinned are removed from the device with their preview;
  pinned ones are already on the board and are kept.
- **Clear moodboard.** Every board now has a **Clear moodboard** button beside
  "+ Pin to board" (hidden while the board is empty). It asks first, then takes
  every pin off — pictures, colours, gradients and notes. A stored picture is
  only deleted when no other board is using it, so anything shared is kept, and
  the empty state comes back.

Both buttons are on every moodboard in the app, because the boards are one
shared component.

The smoke suite's `PIN_STABLE` check now asserts the preview is gone within
the fold, that no tick appears, that the page never scrolls, and that the card
and pin button return to their pre-import positions; a new `BOARD_CLEAR` check
imports, pins, clears the previews, clears the board, and fails if a file is
deleted while still pinned elsewhere, kept when it should be released, or if
either button re-renders the route.

---

## What is new in 3.3.5

**Fixed: pinning a picture still moved the board.** A file waiting to be pinned
sat in a "pending" row in the board's controls; pinning it removed that row, so
everything below — the button, the board, the tiles — shifted up by its
height. The previous fix tried to hold the board still by scrolling the page,
which moved the page instead. The preview now **stays in the tray, marked
pinned** (dimmed thumbnail, green tick, accent border), so pinning changes
nothing above the grid:

- The card keeps its exact height, the pin button does not move, and the page
  never scrolls. The pinned tile simply appears on the board.
- The tray is replaced the next time you choose files, so it never fills up.
- The tick's ✕ removes only the receipt — the file is on the board now —
  and removing the tile removes its receipt too.

Checked on every page with a moodboard — Studio's project moodboard and the
built-in moodboard of Music, 3DFoundry, 2DCanvas and Story designs: after
pinning an imported picture, the card position, card height, pin button and
page scroll are all **0px** away from where they were (the board used to move
154px).

The smoke suite's new `PIN_STABLE` check imports a file, pins it, and fails if
the card, the pin button, the preview chip or the scroll moves at all, if the
preview loses its pinned mark, or if the next import does not replace the tray.

---

## What is new in 3.3.4

**Fixed: the UI reloaded when you pinned something, the boards were not all the
same, and pinning an imported picture slid the board up.** Pinning on the
Studio moodboard called a full page render — the page entrance and every tile
replayed, and the page jumped. Importing and pinning now paint the board in
place, on every moodboard in the app:

- **One board, used everywhere.** The project moodboard in Studio and the
  built-in moodboard of every design in every tool (Music, 3DFoundry,
  2DCanvas, Story) are now the same component (`App.moodBoard` in core.js), so
  they cannot drift apart. Every board carries the same tools: **Media /
  Colour / Gradient / Note**, a media file or a pasted link, a caption,
  **+ Pin to board**, **View the whole board**, **Pin from another board**,
  moving with the **‹ ›** arrows or by dragging, the shared badge, and remove.
  Before this, a tool design moodboard only had images and colours.
- **Nothing reloads.** Importing files, pasting a link, pinning a colour,
  gradient or note, linking from another board, moving and removing all
  repaint only that board — the page entrance does not replay, the tile pop-in
  does not restart, and the page keeps its place. The counts, the size badge
  and the "stored at full size" line update with it.
- **Colours, gradients and notes move between boards too.** "Pin from another
  board" used to offer only files. It now lists every pin — and a board that
  holds nothing but drawn material appears in the picker as well. Drawn
  material shows as itself (a swatch, a gradient, a note), and because it has
  no file behind it, it is copied onto the board asking rather than linked.
  Files are still linked, never copied, and still refuse to appear twice on
  one board; drawn material repeats legitimately.
- **Fixed: pinning an imported picture slid the board up.** A file waiting to
  be pinned sits in a "pending" row above the board; pinning it removed that
  row, and everything below — the board and the buttons — jumped up by its
  height (only visible with a file, which is why it was hard to reproduce).
  In-place repaints now hold an anchor element steady instead of forcing the
  old scroll offset back, so the board stays exactly where it is and the page
  only moves to compensate. Checked on every moodboard page: Studio and all
  four tools hold the board to within a pixel.
- **Take the pictures off** now updates the board in place too (the button
  appears and disappears with the media pins instead of waiting for a page
  render).

The smoke suite's `BOARD_MOVE` check now also pins a colour on both board
kinds and fails if a pin re-renders the route, tears out or rebuilds the board
grid, or fails to paint the new tile in place; a new `PICKER_DRAWN` check
copies a colour, a gradient and a note from one board to another and fails if a
board of drawn material is not offered, is drawn as a broken picture, loses its
value or caption, or re-renders the route. The verify suite pins a colour
through the new board controls on every tool's design page.

---

## What is new in 3.3.3

**Fixed: moving a pin reloaded the moodboard, most boards could not move pins
at all, and moving one in a tool moodboard jumped the page.** The arrows on a
pin called a full page render, which replays the page entrance and the pop-in
on every tile — it read exactly like the app reloading. Moving a pin now
repaints only that board's grid, so the only thing that changes is the order:

- **Every moodboard can move its pins.** The project moodboard in Studio and
  the built-in moodboard of every design in every tool (Music, 3DFoundry,
  2DCanvas, Story) now carry the same **‹ ›** arrows. Before this, a design
  moodboard had no way to move a pin at all.
- **Drag a pin to move it.** With a mouse or trackpad you can drag any tile
  onto another to place it before or after it (a bar marks where it will land).
  The tile is the drag source; the picture inside it is not, so the browser can
  never navigate to the image file — the other way a move could look like a
  reload. The arrows remain the way to move pins on a touch screen.
- **The saved order is the shown order.** A move is written to the store the
  moment it happens, and reopening the board shows the same arrangement.
- **The page stays where you left it.** Moving a pin in a tool moodboard
  emptied the whole board card while it repainted: the page became shorter for
  a moment, the browser clamped the scroll position to the shorter page, and
  the rebuilt board left it there — the page appeared to jump up on its own.
  In-place repaints now remember and restore the scroll position
  (`App.keepScroll`), and the board card and grid survive a move instead of
  being torn down.
- **"Pin from another board" is on the Studio moodboard too.** It used to sit
  at the very bottom of the page, under the palette starters. It now sits with
  **+ Pin to board** and **View the whole board** in the board's own controls,
  exactly where every other board carries it.
- **Pictures can no longer be dragged as files.** Every tile picture (and
  every other picture in the app) now carries `-webkit-user-drag: none`. A
  dragged picture in a WebView could navigate the window to the image file,
  which is a real reload — and the app screen is gone with it.

The smoke suite's `BOARD_MOVE` check moves a pin on a project moodboard and on
a tool design moodboard with the arrows, drags one with real drag events, and
fails if either board re-renders the route, tears out or rebuilds the board
card or grid it is moving pins in (which is what made the page jump), leaves
the store order out of step with the board, or drags without showing the drop
mark. It also checks that Studio's board carries its own "Pin from another
board" button above the grid.

---

## What is new in 3.3.2

**No duplicate pictures on one moodboard — but sharing between boards is
untouched.** The same file can still sit on a project moodboard and on any
number of design moodboards; what it cannot do is appear twice on the *same*
board. Every add path now refuses it:

- **"Choose from this device"** on a project moodboard or a design moodboard
  skips any file the board already holds (the store recognises a file by its
  content, so a second copy is the same id) and says how many were skipped.
  Picking the same file twice in one batch is caught the same way.
- **"Pin from another board"** already left out what the current board holds
  (3.3.1); selecting the same file on two different boards in the picker now
  returns a single pin, and the receiving board re-checks before it links.
- **Pasted links** are also refused when the exact same link is already pinned
  on that board.

Colours, gradients and notes are untouched — those are drawn material, not
files, and repeating one on a board is legitimate. The smoke suite's
`NO_DUPLICATES` check adds the same file to the same project board and the same
design board twice (both refused) and picks it from two boards into an empty
one (pinned exactly once, proving cross-board sharing still works).

---

## What is new in 3.3.1

**Fixed: the picker offered pictures that were already pinned on the board you
were looking at.** Selecting one would have put the same file on the same board
twice. "Pin from another board" now knows what the current board already holds
and leaves those files out — a board with a mix of shared and new pictures
offers only the new ones, and if there is nothing new anywhere the picker says
so instead of opening an empty list. The smoke suite's `BOARD_SHARING` check now
covers it: the file already on the board must not be offered, and the one that
is offered must be the file that gets linked.

---

## What is new in 3.3.0

**Fixed: the "Pin from another board" picker showed empty tiles.** Every tile
in the app fades its picture in by adding an `in` class once the image loads;
the picker's tiles never got that class, so a perfectly good thumbnail sat at
**opacity 0** and the tile looked blank — which is exactly what it looked like:
missing thumbnails. The picker now:

- adds the fade class on load (and when a picture resolves from cache),
- shows the **audio placeholder** for audio pins instead of a broken image,
- shows the same grey "no preview" glyph the boards use when a file cannot be
  shown, instead of an empty box.

Audited every other place tiles render a picture (project moodboards, design
moodboards, video stills, the pending-file preview); all of them already added
the class. The smoke suite now has a `PICKER_THUMBS` check that stores a real
picture on one board, opens the picker from another, and fails if the picture
never loads, never fades in, or if an audio pin shows as a broken image.

---

## What is new in 3.2.9

**Moodboard sharing is global now.** The image store always held one copy of a
file no matter how many boards pinned it — but only Studio's project moodboard
showed it. Every board in the app is now a first-class board:

- **The "shared" badge appears on every board.** Pin the same picture on a
  project moodboard and on a design moodboard in Music, 3DFoundry, 2DCanvas or
  Story, and each pin is marked **shared** so you can see the file is kept
  alive by more than one board.
- **"Pin from another board" is on every board.** The picker lists every board
  in the app that holds a file — project moodboards and every design's
  moodboard, in every tool — with thumbnails and the board it came from. It
  never offers the board you are already on. Picking a file links it: nothing
  is copied, the file stays stored once, and removing it from one board leaves
  the other untouched.
- The Studio moodboard's old "Import from another board" button (which could
  only see other *projects*) has become this global picker. The copy that said
  a design's moodboard "never appears in another tool" was wrong and is gone.

The smoke suite now holds a `BOARD_SHARING` check: a file pinned on a project
moodboard and on a tool design must count as shared from both sides, show its
badge on both boards, and be offered by the picker on either one.

**Less memory held for images, without giving up the speed.** The app used to
keep every full-size picture it had ever shown resolved in memory for the whole
session, and opening a moodboard resolved the entire board's originals before
showing the first one. Now:

- **The viewer resolves one file at a time.** It reads the picture it is
  showing, prefetches the next one so swiping stays instant, and nothing else.
  A 100-image board opens as fast as a 3-image one and holds a fraction of the
  memory.
- **The full-size URL cache is a small most-recently-used set** (four files,
  with a short grace period so a picture that is still loading can never be
  revoked out from under the screen). Anything evicted is simply read from the
  device again when it is next asked for — milliseconds.
- **Adding pictures no longer pins them all in memory.** Importing a batch used
  to keep every original (and any video) alive from the moment it was stored;
  tiles use the 800px copy, so the originals now wait until they are viewed.
- **Thumbnails keep a generous cap** (180), so tiles stay quick on big boards,
  and each one is regenerated only if it ever needs to be.

The smoke suite's `CACHE_BOUNDS` check opens a six-image board and fails if the
viewer resolves the whole board — the old behaviour — rather than the picture
being looked at.

---

## What is new in 3.2.8

**Fixed: leaving the cover no longer fades the page in twice.** Stepping from
the all-tools cover into a tool used to animate the whole page in, then animate
it in again about half a second later — which read exactly like the page
reloading. The cause was not a second render. The transition marker on the
shell swapped the entrance animation for a different one; removing the marker
half a second later swapped it back, and changing the animation's name restarts
it from the top. The entrance now keeps one animation from start to finish, so
one tap still renders one page **and paints it once**. The smoke suite checks
this on every build.

**The sources were checked, and there are more of them.** Every headline number
in the guides was re-checked against its source in September 2026 — Steam's
release volume, the June Next Fest demo count, the Megabonk figures, the
Blender 5.2 LTS release dates, the REAPER 7 feature list and the loudness
standards all hold. Eight new sources were added to the Vault's Sources tab for
the numbers the calculators quietly rely on: the platform's standard 30% share
(and the 25%/20% tiers above $10M/$50M), Steam's 14-day / 2-hour refund rule,
the $100 Steam Direct fee, the wishlist and store-page conversion benchmarks,
the healthy refund and review ranges, and the paid-ads break-even — with the
money assumptions labelled as the planning models they are.

**Corrected: the seasonal sale rule.** The roadmap guide claimed a launch
discount must finish 30 days before a Steam seasonal sale or you cannot take
part. Valve exempts its big seasonal sales from the 30-day cooldown, so that
was wrong. The roadmap guide, the marketing guide and the discount-ladder tool
now say what actually happens.

**Hardened: the storage echo guard.** The app records the exact value it is
about to save *before* the write, so a WebView that fires the storage event
back synchronously cannot slip past the guard and trigger a spare re-render.

---

## What is new in 3.2.7

**No more pull-to-stretch on Android.** Dragging past the top or bottom of a
page — or flinging into the edge — used to stretch the whole screen away from
the system bars, because the WebView's overscroll effect treated the page like
a photo. The shell now turns the WebView's overscroll off outright, and the
page itself refuses the rubber band in CSS as well.

**Fixed: one tap loads one page.** A navigation now renders exactly once on
every device. Some WebViews send the same hash change twice for a single tap,
which rebuilt the page a moment after it appeared and read as the app
reloading; a repeated event for a page already shown is ignored, and so is a
storage event echoing the window's own backup write. (The storage listener
also had a wrong key name and had never actually fired — cross-window changes
now sync properly.)

---

## What is new in 3.2.6

**The window is the page on a PC.** The content used to stop at 1240px, which
left the rest of a wide window as an empty paper gutter down the right-hand
side. Above 1500px it now runs to the window edge; on smaller screens the
column is centred instead of left-aligned.

**The UI runs behind the scrollbar on a PC.** The desktop shell asks for
floating overlay scrollbars, so the page uses the full window width and the
bar appears over it only while scrolling — the same edge-to-edge the phone
already gets, and only on PC.

**The Android navigation strip matches the top bar.** On every page except the
cover it now wears the top bar's surface colour and hairline instead of a
plain paper band. The cover — the all-tools front door — stays full-bleed,
with the UI running behind the navigation bar the way it already runs behind
the status bar.

---

## What is new in 3.2.5

**The page stays put behind the open sidebar.** The drawer now locks the page
underneath it: the blurred page can no longer be dragged or scrolled while the
menu is up, and the Android back gesture closes the drawer instead of walking
the page backwards behind it.

**The drawer is usable on a phone held sideways.** A short, wide screen turns
the drawer into one scrolling column — every section, the stats and the New
project button stay reachable — instead of squeezing the menu to nothing and
pushing the footer off the screen.

**The system buttons get their space.** The app already left room for the
status bar; now the navigation buttons get the same treatment. On Android the
safe-area insets are filled with the page colour, so content scrolls under a
solid band rather than showing through behind the buttons, and every fixed
bar, dialog, toast and drawer respects the left, right and bottom insets too.

---

## What is new in 3.2.4

**Vault is on every tool's Home.** Music, 3DFoundry, 2DCanvas and Story each
carry a **Vault** card beside Learn, Practice, Design and the Pocket timer, so
backups, notes, reusable templates, the glossary and settings are one tap from
the page each tool opens on.

**The Pocket tools' home pages carry Practice and Vault buttons.** Each Pocket
tool's session page now has a "Go straight there" row with **Practice** (that
tool's finished-session log) and **Vault**, alongside the tabs that were
already in the bar.

---

## What is new in 3.2.3

**Fixed: zooming into a moodboard picture no longer flicks to another one.**
A pinch recorded where its first finger landed, so letting the pinch go read
as a swipe and threw the viewer at the next reference; a swipe now has to be a
plain one-finger gesture that starts and ends un-zoomed. While the viewer is
open, the Android back gesture closes the viewer instead of walking the page
underneath backwards — the other half of the "sometimes it changes page" bug.

**Design is on every tool's Home.** 2DCanvas, Music, 3DFoundry and Story each
carry a **Design** card beside Learn, Practice and the Pocket timer, opening
that tool's own design document and its built-in moodboard. Every card on
every tool's Home now wears the same icon-and-two-lines shape as Studio's
"Jump in" grid, and Studio's Home keeps that shape before the first project
exists as well as after it.

**Full screen is video-only in the viewer.** Images and audio no longer offer
a Full screen button. Images still zoom right down to the original pixels,
video still has its own full-screen button, and the whole-window switch in
Vault → Settings is untouched.

---

## What is new in 3.2.2

**Moodboards take video and audio.** The Studio moodboard and every design's
built-in moodboard now accept videos and sound files alongside images, colours,
gradients and notes. Files are stored exactly as they are, deduplicated by
content, and carried by the same backups and zips as everything else. Click a
tile and it plays right there in the viewer; audio keeps playing until you
close the viewer, and a broken file simply shows a grey picture glyph instead
of an error.

**Videos get a still frame; audio gets an icon.** Each video is asked for one
frame, once, which is kept and used as the tile picture with a play badge over
it — no video decoders sitting in the grid. Audio tiles carry a speaker icon,
the file name and a play badge.

**Moodboards got fast on phones.** Tiles no longer decode a 4000px photo (or a
whole video) to fill a 150px box: each stored file gets one small thumbnail, at
most 800px on the long edge, made once and kept beside the original in its own
store — never included in backups or exports, since it can always be made
again. A board of fifty photos now paints from fifty small pictures. Tiles
shimmer gently while their picture arrives and fade it in, and only two
thumbnails are built at a time so a big board stays responsive. Clicking a
tile still opens the untouched full-resolution original.

**Full screen for pictures, video, and the whole app.** The viewer's **Full
screen** button now covers images as well as video. On the desktop it uses the
real thing; on Android, where the WebView refuses native video fullscreen, the
player expands to fill the app instead — and the app already fills the phone
screen. On PC, Vault → Settings gains a **Full screen** switch that puts the
whole window full screen and remembers the choice.

---

## What is new in 3.2.1

**Every tool has its colour back, tuned to the new palette.** The 3.2.0 logos
were all moss-green, which lost which tool was which — Story, for one, stopped
being blue. Each mark now keeps its own hue again: Studio green, Music violet,
3DFoundry orange, 2DCanvas teal and Story blue — but muted to earthy, mid-tone
shades so they sit with the paper, ink and moss chrome instead of shouting over
it. The same tuned colours drive each tool's accents (the card top borders and
module headers) and the splash screen.

**The splash screen shows the real tool marks.** The little coloured dots in
the intro list are gone: each line now carries the tool's actual logo, so the
list reads as the five tools (and the Pocket mark) rather than six abstract
dots.

---

## What is new in 3.2.0

**A new look: warm field-notes editorial.** The app now wears the palette and
type of a printed field guide instead of a dark dashboard. **Field notes** —
warm paper, soft ink and moss — is the default theme; **Linen** is the light
one and **Greenhouse** the deep night one, all three still one tap away in
Settings or behind the top-bar theme button. Headings are set in Newsreader,
UI labels stay in Archivo, corners are softer, shadows are warm, and the neon
gradients are gone. It is the same app to use — just calmer to look at.

**Every logo is redrawn, and every one is transparent.** The thirteen brand
marks — Toolbox, Studio, Music, 3DFoundry, 2DCanvas, Story and the five Pocket
marks — are new artwork in the same moss, lichen and amber palette. None of
them sits on a coloured tile any more, so they read cleanly on paper, on linen
and on greenhouse. The desktop icon, Android launcher icons, store icon and
Android splash screen were rebuilt from the new artwork.

**Everything still works the same way.** Same screens, same buttons, same
behaviour and the same saved data. The redesign is stylesheet and artwork only:
no feature was removed, and nothing about existing projects, designs,
moodboards or logs changed shape.

---

## What is new in 3.1.8

**Fixed: the splash screen no longer clips on short or scaled screens.** On a
phone in landscape, a laptop at 150% display scaling, or any window shorter
than the intro, the bottom of the splash — the status line, **Start working**
and **Don't show this again** — was cut off, and because the container refused
to scroll there was no way to reach it. The splash now scrolls when the content
does not fit and only centres itself when there is room to, so every control
stays reachable on any screen.

**Fixed: restoring a full backup can no longer hang.** A zip whose manifest
said it was an images-only archive was refused with no answer, so the Restore
dialog sat waiting forever. It now reports the problem and points at **Import
images** instead. Restoring also applies the backup's own theme and effects
settings immediately, rather than at the next launch.

**Fixed: a day can no longer log more than 24 hours.** The **+1h / +2h / +4h**
buttons on the week card could push a day past 24 h — the day dialogs always
capped at 24 — and the toast still claimed the hour was logged. The buttons are
now disabled once the day is full, every path caps at 24 hours, and the 14-day
editor's running total matches what saving will store.

---

## What is new in 3.1.7

**Every tool now keeps several designs, and each one has its own moodboard.**
The Design page in Music, 3DFoundry, 2DCanvas and Story used to hold one
document and one set of references. It now holds a list of named designs —
"Forest shrine", "Title screen", whatever the thing is — with a picker to
switch between them. Each design carries its own written fields **and its own
built-in moodboard**: images and colours pinned beside it, never shared with
another design, another tool or Studio's moodboard. Old single-document data is
moved into a first design called "Design 1" automatically, so nothing is lost.
The page exports one design or all of them as Markdown.

**Designs can be deleted.** A **Delete** button on the design header removes
the selected design after a confirmation. Its written fields and moodboard pins
go with it; a stored picture is only removed from the device when no other
board is still using it, so shared references stay intact. **Rename** and
**+ New design** sit beside it.

**The Home page's "What is inside" cards are tappable links now.** On Studio's
Home, the eight cards under **What is inside** (Plan, Design, Market,
Marketing, Toolbox, Build, Learn, Vault) were plain text — tapping them did
nothing, on any platform. They are real links to their pages now, which also
makes them work in the Android WebView, where taps outside a link were never
guaranteed to register. The three navigation buttons under **Start here** were
turned into links for the same reason.

**One zip now backs up the whole toolbox — data and images together.** The
Vault's Backups card gains **Save everything (.zip)** and **Restore everything
(.zip)**. The archive holds every project, task, note, design, setting and
stored picture at full size in a single file. Restoring replaces what is on the
device and relinks every moodboard tile and design pin to the stored image —
including when the picture was already on the device, in which case the
existing copy is reused instead of duplicated. The old JSON-only backup and
images-only zip are still there under the same card.

**Fixed: the hours counter stops at zero, and "Last week" never shows a
minus.** Taking an hour off a day that has none left now simply leaves the day
empty instead of writing a zero entry, and the **−1h** button on the week card
is disabled until there is an hour to take off. The **Last week** stat used to
read "2 h · −2" whenever this week's total was behind last week's; it now shows
last week's total alone, so the change readout never drops below zero.

---

## What is new in 3.1.4

**The "← All tools" button is gone from page heads.** It appeared under the
title on Studio's Home, on every learning tool's pages, on the practice page
and inside the Pocket tools — and the cover was already one tap away in the
drawer's **All tools** entry and the top bar's **Switch tool…** button, so the
extra button only added noise. Page heads now go straight to their content on
every platform. The drawer entry and the switcher are untouched.

**The logo now leads to your tool's Home.** Tapping the brand mark — in the
sidebar or the top bar — goes to the Home page of the tool you are in: Studio's
Home in Studio, Music's Home in Music, 3DFoundry's in 3DFoundry, and so on; in
a Pocket tool it opens that Pocket tool's session page. It is the familiar
"logo goes home" behaviour, scoped to the tool rather than throwing you back
to the cover.

**Fixed: timer progress bars now fill while they run.** Every timed routine's
meter — the Music and 3DFoundry sprint clocks, 2DCanvas's studio clock, Story's
sprint clock and the Build drill — only moved when you pressed a button,
because the ticker updated the clock text and nothing else. The tickers now
update the meter on every tick, so the bar fills as the phase counts down.

---

## What is new in 3.1.3

**Every main tool now has the same practice desk.** Studio's practice page and
the four learning tools' practice pages carry the same five things: the
**Weekly practice target** for that tool, the **Weekly practice target** for
every tool together, the **What I am working on** plan, the per-tool week
gauges, and the practice report. Studio gains the "This tool" target it was
missing — scoped to Pocket Studio and stored separately from the all-tool one,
so the two can differ — while the learning tools gain the every-tool target
and the gauges.

**Every tool's Home card shows both week totals as bars.** "Practice this
week" now has two labelled meters: **All tools** (the whole toolbox against
the all-tool target, in the accent colour) and the tool's own field (Music,
3DFoundry, 2DCanvas, Story, and Studio for Studio) against its own target, in
the secondary colour — so the field total and the toolbox total read at a
glance instead of hiding in a sentence.

**The Pocket practice tab's "Combined report" link now goes to its main tool.**
Pocket Music opens Music's practice page, Pocket 3DFoundry opens 3DFoundry's,
Pocket 2DCanvas opens 2DCanvas's, Pocket Story opens Story's, and Pocket
Studio opens Studio's — instead of all of them landing on Studio's page.

---

## What is new in 3.1.2

**You choose where exports are saved now, on every platform.** Before, backups
and the images zip were handed to whatever the shell did by default — a download
that landed wherever the desktop or browser put it, and a cache file passed to
the Android share sheet. The Save button now asks:

- **Windows app** — a real **Save as** dialog, starting in your Downloads folder
  with the filename filled in and the right filter (JSON backup, zip archive,
  Markdown, text). The file is written exactly where you point it.
- **Android app** — the system **create-document picker** (Storage Access
  Framework): choose the folder and the filename, anywhere the picker can reach,
  including Downloads, Documents, an SD card or Drive. Cancelling is treated as
  a cancel, not an error. This is a new local plugin (`SoloDevSave`), not a
  fixed folder.
- **Browser** — the File System Access picker where the browser offers it, and
  the ordinary download flow everywhere else.

Every export uses it: the JSON backup (top bar and Vault), the stored-images
zip, and the Vault template "Save as file" buttons.

**Tapping the logo does nothing.** The brand marks in the sidebar and the top
bar were links back to the cover; they are plain labels now, so a stray tap at
the top of the screen cannot interrupt what you were doing. The cover is still
one tap away — **All tools** in the drawer, or **Switch tool…** in the top bar.
(3.1.4 later made the logo lead to the current tool's Home instead.)

**Small text fix:** the action guide's frame-data cards read "3–8 fr", "2–4 fr"
and so on; they now say **frames**, spelled out.

**The practice report is on every practice page.** The all-tool report — this
week, last 30 days, all time, by tool, by project, and the last 14 days — used
to live only on Studio's Practice page. Every learning tool's Practice page now
carries it as well: Studio, Music, 3DFoundry, 2DCanvas and Story. (The Pocket
tools' Practice tab is their own session log and stays as it was.) The Studio
practice page also no longer offers its "Open the practice plan" shortcut,
which only pointed at the page you were already on.

**"Practice this week" now lives only on Home pages — and shows both numbers.**
The card on Studio's Home gives the all-tool week and, under it, the separate
Pocket Studio number; each learning tool's Home card gives that tool's week and
the all-tool total. It appears nowhere else: on a practice page the **Weekly
practice target** card is the weekly number, and on Studio it is followed by
the per-tool gauges below. (3.1.3 turned those two numbers into two labelled
bars — see above.)

**Fixed: clicking a moodboard image opened the first one.** When the image URLs
were already cached — which is exactly what happens once the board has drawn —
the full-screen viewer was created in the middle of the scan with only the
first tile in its list. It now waits for every tile before opening, on the
moodboard and on each tool's design references. Tapping a tile opens that tile,
with the right "n of m" counter.

**Fixed: the Build drill jumped the page.** Pause and Resume rebuilt the whole
drill card, which took the button out from under the tap and scrolled the page
on some platforms, Android in particular. The card now updates its clock,
badge, steps and buttons in place, so the button stays put and the page does
not move.

**Studio's weekly number now breaks down per tool.** The weekly target on the
Studio Practice page counts every Pocket tool at once, which made Pocket Studio
practice invisible on its own. A new **This week, by tool** card sits under the
target with one gauge per Pocket tool — Pocket Studio included — each showing
that tool's share of the same weekly target, so a week of Studio-only sessions
reads as its own number.

---

## What is new in 3.1.1

**Android now has no bottom bar.** Every section stays in the drawer, which
opens from the tray button in the top bar, so the bottom of the screen is clear
again on a phone. The bar is untouched on Windows and the web, where it is still
the quick way around a narrow window. (This is Android-only: `html.android-app`
hides the tab bar, and pages drop their tab-strip clearance so they only reserve
room for the system navigation bar.)

**The drawer's stats and New project button are visible again on Android.**
They were being pushed behind the system navigation bar: the drawer is
edge-to-edge, so its last rows sat under the Android buttons while the tab bar
(which had its own bottom padding) did not. The drawer now reserves the bottom
safe area exactly like the bar did — Projects, This week, In progress and
**+ New project** all stay on screen.

The Android-shell smoke test now asserts both: the bottom bar is hidden, and the
drawer's foot is on screen with its three stat rows, the New project button and
the bottom safe-area padding in place.

---

## What is new in 3.1.0

**Practice is now reachable from every tool.** The learning tools' plan page was
already their practice page, so its sidebar and tab entry is now labelled
**Practice** (Studio already had one). The Pocket tools' session-history tab is
labelled **Practice** too — every one of the ten tools now has a Practice entry
in the same place.

**The bottom bar now carries every section the sidebar carries.** The tool pages
(Sprint clock, Song map, Mix desk, Foundry desk, Studio clock, Scene cards,
Build and the rest) no longer exist only in the drawer — every sidebar icon is a
tab at the bottom: ten tabs in Studio, Music and 3DFoundry, eleven in 2DCanvas
and Story, and three in each Pocket tool. On narrow screens, tools with ten or
more sections split the bar into **two balanced rows** instead of shrinking into
slivers, so every icon and label stays readable and finger-sized without
sideways scrolling; it returns to a single row whenever there is room, and
re-lays itself out on rotation and resize. Across the tested phone widths
(320, 360 and 540 px) the narrowest tab measured 48 px and nothing was pushed
off the edge. (Android later dropped the bar entirely — see 3.1.1 above — so
there the drawer is the navigation.)

**The sidebar tray button works on mobile again, including the Android app.**
The hamburger was previously hidden and the drawer disabled inside the APK; now
the tray button is visible on phones and opens the full sidebar — brand, "All
tools", "Switch tool…", every section, project stats and **New project** — in
the packaged Android app just as it does in a narrow desktop window.

All navigation checks in the smoke and verification suites were updated for the
new layout, including a dedicated Android-shell test for the tray button and
drawer and a per-tool phone check of the tab bar.

One reading note for the older sections below: where a version before 3.1.0
says a tool page "stays out of the phone tab bar", or calls a learning tool's
practice page its "Plan", 3.1.0 is what changed both — the histories are kept
as they were written.

---

## What is new in 3.0.9

**SoloDev 3DFoundry is now a full Blender-to-engine production curriculum.** The
old page had eleven short sections on modelling, UVs, rigging and export. It now
walks the whole pipeline in order — standards and scale, blockout, modelling,
topology, UVs and texel density, PBR and cel-shaded materials, sculpting, baking,
anime assets, rigging and weights, animation, lighting, export, Unity 6
integration, optimisation and a final quality audit — with the daily 15-minute
asset sprint and the five-day rotation as the practice system that ties it
together. The lessons grew from 11 sections to **20 sections, 98 lessons,
56 exercises and 20 reference tables**.

**Three working tools on their own pages** (reachable from the 3DFoundry sidebar
and from Learn; they stayed out of the phone tab bar until 3.1.0 gave every section its own tab):

- **Sprint clock** — nine timed routines with a real, running clock: the
  15-minute asset sprint (silhouette → topology → origin/UV → export and
  engine), the 20-minute boxout, and the 30-minute prop, retopo, UV and texture
  passes, plus the 30-minute rig-and-weights pass, the 15-minute quality audit
  and the 15-minute engine integration. Each phase shows its own steps, the
  timer advances by itself, and the bell is the discipline.
- **Sprint week** — the five-day rotation as cards: theme, target examples, the
  pipeline focus it trains and the minutes planned, with a rotation strip, a
  weekly total and a done toggle. Add the standard five-day week in one click,
  reorder and edit the cards, copy as Markdown or export.
- **Foundry desk** — the maths and the reference tables on one page: texel
  density (px/m, px/cm and coverage), texture memory from resolution and format
  with the mip-chain cost (2048 RGBA8 is 16 MiB base, about 21.3 MiB with mips),
  metres → centimetres/feet/inches, and material slots → draw calls. Below it:
  texel-density targets, real-world scale, texture memory, starting-point
  polygon budgets, naming conventions and the frame budget.

**The new curriculum sections in full:**

- **Standards, units and scale** — engine-first working, metric units at scale
  1.0, origin rules by asset category, Blender Z-up vs Unity Y-up vs glTF's
  +Y-up/+Z-forward, and the studio-style SM_/SK_/M_/T_/UCX_ naming convention.
- **Blockout and silhouette** — the volumetric hierarchy, the 20-minute boxout
  windows, head-count proportions (7.5–8 realistic, 6–7 stylised), negative
  space, and modular grid discipline.
- **Topology and edge flow** — quads/tris/n-gons, loops, rings and poles, the
  four deformation rules (orbital eye loops, a radial mouth ring, triple loops
  at joints, shoulder saddle loops), and density by category.
- **UVs, seams and texel density** — unwrap-by-projection, seam placement by
  category, the density maths (1024 px/m = 10.24 px/cm), padding and packing,
  and the checker test.
- **Baking and game-ready maps** — Selected to Active step by step, the four
  classic bake faults, which maps ship, and texture memory arithmetic.
- **Anime and cel-shaded assets** — planar clarity, the stylised face and the
  custom-normal transfer trick, hair in three tiers, the packed RGBA cel-shade
  control map, and the inverted-hull outline.
- **Unity 6 integration** — the Model and Rig tab settings that matter, the
  Humanoid avatar workflow with Enforce T-Pose, the URP toon Shader Graph
  chain, colliders and prefabs, and secondary motion.
- **Performance and the polygon budget** — why no engine publishes a triangle
  budget, working starting ranges, draw calls and material merging, LODs and
  culling, and the frame budget (60 FPS ≈ 16.7 ms).
- **Quality audit and error correction** — the 15-minute, five-phase protocol:
  transform drift, joint crushing, normal tears, mesh penetration and outline
  breakage, each with its inspection method and remedy.
- **The 15-minute asset sprint and the weekly rotation** — why the clock works,
  the four windows, the industrial → fantasy → modular → nature → kinetic
  rotation, archiving, and how to escalate from 15-minute sprints to real
  production passes.
- Plus rewritten and expanded **modelling**, **materials**, **sculpting**,
  **rigging**, **animation**, **lighting**, **export** and **modifiers**
  sections, and an expanded practice ladder that ends in a Home scene.

**Fact-checking and corrections** (all numbers are listed under the **3D art**
group in the Vault, 36 claims in total):

- Blender's current stable line is **5.2 LTS** (5.2 released 14 July 2026,
  5.2.2 LTS on 15 September 2026), not 5.1 as the source texts assumed.
- Blender **4.1+ replaced the Auto Smooth property with the Smooth by Angle
  modifier**; the guide uses the current behaviour.
- The FBX exporter's real defaults are stated correctly: Forward −Z / Up Y,
  Apply Unit on, **Apply Scalings defaults to All Local**, **Add Leaf Bones
  defaults on** (turn it off for game rigs), and Apply Modifiers must be off to
  export shape keys.
- Unity's skinning limits are corrected: the Quality setting defaults to
  **4 bones per vertex** and can be set to Unlimited (up to 32 influences) — the
  guide recommends 4 clean, normalised influences as the design target rather
  than repeating the old "never more than 4" claim.
- glTF's coordinate system is stated correctly (**+Y up, asset fronts +Z**),
  and Unity's glTF import path (**Unity glTFast**) and Godot's native glTF
  import are both verified.
- Unity's **Character Controller defaults to a 2 m capsule** and Unity's manual
  recommends around 2 m for human-like characters — the guide distinguishes that
  from the 1.8 m human art convention.
- Texture memory is honest arithmetic: RGBA8 base sizes and the ×4/3 mip-chain
  cost (2048 = 16 MiB → ≈ 21.3 MiB); ASTC is named as the mobile compressed
  format.
- The category triangle ranges are labelled **working craft ranges, not engine
  limits**, because Unity publishes no fixed triangle budget — the guide tells
  you to profile and let the numbers win.
- Timed routines are flagged in the Vault as craft routines supplied with the
  build, exactly as the music and story routines are.

**Pocket 3DFoundry grew into a one-prop handbook**, following the same pattern
as the other Pocket tools: plain-English words (unit, origin, silhouette,
triangle budget, texel density, prefab), a beginner start-here card, a **one-prop
day plan** with a live clock, **four props that fit in a day** (the sci-fi crate,
the fantasy sword, the mushroom cluster, the lever switch) with keep/cut lists,
the six ways a prop day dies, a twenty-minute export-and-prefab walkthrough, and
a **not-today list** that persists.

Thirty-three new claims are listed under **3D art** in the Vault, and 47 new
terms (topology, quad, n-gon, edge loop, pole, support loop, manifold, texel
density, UV island, seam, padding, bake, cage, tangent space, retopology,
Dyntopo, voxel remesh, multiresolution, decimate, LOD, draw call, inverted hull,
cel-shade control map, blendshape, viseme, bone roll, influences, action, prefab,
collider, pivot, trim sheet, atlas, AO map, mipmap, vertex colour and more) are
in the glossary — the glossary is now **164 terms**.

---

## What is new in 3.0.8

**SoloDev Music is now a full production curriculum.** The old page had eleven
sections covering the basics. It now walks from session calibration and
reference discipline down to plugin surgery — the REAPER feature set, routing
and sidechaining, arrangement and soundstaging, editing and comping,
automation and modulation, and the stock plugin kit — and every number and
feature it claims has been checked (see the **Music** group in the Vault).

**Three working tools on their own pages** (reachable from the Music sidebar and
from Learn; they stayed out of the phone tab bar until 3.1.0 gave every section its own tab):

- **Sprint clock** — eight timed production routines with a real, running
  clock: the 15-minute track sketch, the 5-minute hook sprint, and the
  30-minute MIDI, arrangement, editing, mixing and mix-fix passes, plus the
  15-minute master check. Each phase shows its own steps, the timer advances
  by itself, and the bell is the discipline.
- **Song map** — one card per section (bars, energy 1–10, and the one thing
  that changes), drawn as an energy line, with the total bar count and the
  running time at your tempo. Add the eight-bar frame in one click, reorder,
  edit, copy as Markdown or export.
- **Mix desk** — the maths and the reference tables on one page: delay times at
  your tempo (dotted and triplet values too), loop length in seconds and
  samples at 48 and 44.1 kHz, loudness targets from the platforms themselves,
  and the frequency map of where instruments actually live.

**The lessons grew from 11 sections to 18** (101 lessons, 54 exercises):

- **References and targets** — the four reference types, the rule of three, a
  reference track wired around the master chain, and gain-matching before any
  comparison (with the Fletcher–Munson / ISO 226 reason why).
- **Warmup and sprints** — the 15-minute track sketch, the five-minute
  emotion-to-arrangement routine, the five-minute hook constraint sprint, the
  twenty-second sound rule, and the archive rule.
- **Space, depth and stereo** — the three planes, the band-limited reverb send,
  tempo-synced delay, mono below 120 Hz, and the mono check.
- **Tracks, routing and FX chains** — REAPER's universal track model, folders
  as buses, send taps, the routing matrix, sidechaining in five steps, FX
  containers and parallel routing, and freezing.
- **Editing, comping and tuning** — crossfades and micro-fades, slip editing,
  dynamic split, stretch markers, REAPER 7 lanes and swipe comping, cleanup
  instead of gating, and phase alignment.
- **Automation and movement** — fader rides before compression, pan and width
  over time, sweeps and risers, parameter modulation, and ducking with a curve.
- **The stock plugin reference** — ReaEQ, ReaComp, ReaXcomp, ReaDelay, ReaVerb,
  ReaGate, ReaTune, ReaFir, ReaSamplOmatic5000, the JSFX soft clipper, ReaLimit
  and the render loudness report — with a first move for each.
- **The production pipeline** — the eight phases from calibration to master,
  timeboxing, separating the composer from the engineer, and ear-fatigue
  resets.

**Fact-checking and corrections:** the loudness targets now come from the
platforms rather than habit — streaming normalises to −14 LUFS, EBU R 128
broadcast is −23, and Sony's ASWG recommendation is −23 LUFS for console and
desktop games and −18 for portable; the true-peak ceiling is −1 dBTP; REAPER's
time-stretch history, plugin list and version 7 features are verified against
Cockos and Wikipedia; and the “Audio Damage 1175” attribution in the source
material was dropped rather than repeated, because no such stock JS plugin
could be confirmed.

**Pocket Music grew into a one-loop handbook**, following the same pattern as
the other Pocket tools: plain-English words (bar, BPM, loop, sub-bass,
sidechain, LUFS), a beginner start-here card, a **one-loop day plan** with a
live clock, **four loops that fit in a day** (the driving loop, the
melancholic loop, the combat layer set, the stinger) with keep/cut lists, the
six ways a music day dies, a twenty-minute export-and-post walkthrough, and a
**not-today list** that persists.

Twenty-eight new claims are listed under **Music** in the Vault, and thirty new
terms (LUFS, true peak, gain staging, sidechain, parallel compression,
transient, pre-delay, dither, stems, ADSR, saturation, pink noise and more) are
in the glossary — the glossary is now 117 terms.

---

## What is new in 3.0.7

**SoloDev Story is now a full writing curriculum.** The old page had eight
sections on structure, characters, worldbuilding and quests. It now walks from
five story structures down to the sentence — point of view, punctuation,
filter words, subtext, scene construction, atmosphere, revision — and every
structure, technique and tool it names has been checked and sourced (see the
**Writing** group in the Vault).

**Three working tools on their own pages** (reachable from the Story sidebar and
from Learn; they stayed out of the phone tab bar until 3.1.0 gave every section its own tab):

- **Sprint clock** — seven timed writing routines with a real, running clock:
  the 15-minute prose sprint, the 5-minute conflict-to-scene, and the 30-minute
  scene build, atmosphere, line, render and revision passes. Each phase shows
  its own steps, the timer advances by itself, and the bell is the discipline.
- **Scene cards** — one card per scene (goal, obstacle, turn, intensity 1–10),
  drawn as an intensity graph. A flat middle shows up before a word is written.
  Add the five beats in one click, reorder, edit, copy as Markdown or export.
- **Draft desk** — paste a draft and read it the way an editor does: filter
  words, -ly adverbs, fancy dialogue tags, filler, sentence-length spread,
  longest sentences, and a read-aloud time. The text stays in the window;
  nothing is uploaded or stored.

**The lessons grew from 8 sections to 16** (106 lessons, 62 exercises):

- **Story shape** — three acts, five beats, the seven-point line, the story
  circle, kishōtenketsu, scene and sequel, and the “therefore / but” rule.
- **Characters and arcs** — want/need/lie, the five-minute character engine,
  the antagonist as hero with different information, and the wound behind the lie.
- **Point of view and distance** — the five POV engines, the psychic-distance
  ladder, free indirect discourse, and the camera-versus-narrator decision.
- **Sentence craft** — loose and periodic sentences, punctuation as a pacing
  governor, sentence-length calibration, polysyndeton and asyndeton, terminal stress.
- **Word choice and verbs** — Anglo-Saxon texture versus Latinate distance, verbs
  over adverbs, the filter-word purge, and specific nouns.
- **Subtext and layering** — the layer stack, blending modes for prose, the
  objective correlative, emotional subsurface scattering and the reality pipeline.
- **Dialogue** — the text/subtext/action-beat triad, the tag protocol,
  front-loaded lines, and barks that survive combat.
- **Pacing and themes** — compounding resistance (“yes, but” / “no, and”),
  scene length as a gear, and intensity mapping.
- **Scene construction** — the 30-minute scene plan, the bounding box, physical
  geometry, entry vectors and the emotional delta.
- **Atmosphere and setting** — tri-plane blocking, sensory baselines, noun
  specificity, tactile scuffs, negative space and focal polish.
- **Revision and diagnosis** — the four-pass order, the filter purge, the
  greyscale value check, read-aloud scansion, the 10% cut and the cold read.
- **Writing for players** — player authorship, ludonarrative consistency,
  environmental storytelling, cutscene economy, lore delivery, and the free,
  open-source tools (Twine, ink, Yarn Spinner) that fit one person.

**Fact-check corrections and confirmations**: structures are attributed where
they belong (Harmon’s circle, Swain’s scene/sequel, Wells’ seven points,
kishōtenketsu, Parker and Stone’s but/therefore rule), the objective correlative
is dated to Eliot’s 1919 essay, the sentence-length demonstration is credited to
Gary Provost’s 100 Ways to Improve Your Writing (1985), the read-aloud estimate
uses the verified 150–160 words-per-minute audiobook range, and the narrative
tools are confirmed MIT-licensed (ink, Yarn Spinner) or free and open source
(Twine).

**Pocket Story grew into a one-scene handbook**, following the same pattern as
Pocket Studio and Pocket 2DCanvas: plain-English words (scene, turn, subtext,
action beat, filter words, bark), a beginner start-here card, a **one-scene day
plan** with a live clock, **four scenes that fit in a day** (the scene that
turns, the polite duel, the quest spec, the bark set) with keep/cut lists, the
six ways a writing day dies, a twenty-minute posting walkthrough, and a
**not-today list** that persists.

Sixteen new claims are listed under **Writing** in the Vault, and twenty-two new
terms (logline, beat, psychic distance, free indirect discourse, objective
correlative, filter words, polysyndeton, asyndeton, bark, ludonarrative
dissonance and more) are in the glossary — the glossary is now 87 terms.

---

## What is new in 3.0.6

**2DCanvas is now a full production line.** The old page had fundamentals,
lineart, colour, anatomy and critique. It now walks from a reference board to a
finished, graded image, and every claim about Ibis Paint X has been checked
against the app's own tutorials and feature list (see the **2D art** group in
the Vault for the sources).

**Three working tools on their own pages** (reachable from the 2DCanvas sidebar
and from Learn; they stayed out of the phone tab bar until 3.1.0 gave every section its own tab):

- **Studio clock** — every timed routine on the page with a real, running
  clock: the 15-minute cinematic warmup, the 5-minute story-to-sketch, and the
  30-minute sketch, background, line-art, light and fix routines. Each phase
  shows its own steps, the timer advances by itself, and the bell is the
  discipline. It keeps running while you are elsewhere in the app.
- **Canvas sizer** — work out the real pixel size before drawing. For print,
  enter the paper and dpi and get pixels, inches, megapixels and aspect ratio
  (with the official guidance: 350 dpi for colour, 600 dpi or more for grey
  scale and black & white, pixels = inches × dpi). For screen, pick the final
  destination from the standard social and desktop sizes.
- **Value checker** — load a photo or one of your own exports and see it as two,
  three or five flat value bands. The squint test, done exactly. Nothing is
  uploaded or stored.

**The lessons grew from 11 sections to 20** (84 lessons, 45 exercises):

- **Reference and ideation** — the four reference types (structure, light,
  costume, finish benchmark), the rule of three, primitive breakdowns with the
  3D mannequin, and the floating Reference Window.
- **Warmup routines** — the 15-minute cinematic thumbnail minute by minute, and
  the three-beat story-to-sketch in five minutes.
- **The 30-minute sketch** — five timed phases, visual chunking, fabric tension.
- **Layers and blend modes** — the nine-layer stack, layer types, clipping and
  alpha lock, and the full official blend-mode families in a table with what
  each mode actually does.
- **Anime rendering** — the lighting stack, the glass-jewel eye in five layers,
  hair ribbons and the angel-ring highlight, and translucent bangs.
- **Backgrounds** — volumetric Shinkai skies, Ghibli foliage and komorebi,
  urban perspective with the Perspective Array ruler, and the Anime Background
  filter trick.
- **Cinematic polish** — aerial haze, bloom, chromatic aberration, dust motes
  and one flare, then a final grade that keeps the greyscale check passing.
- **Realistic rendering** — planar structure, subsurface scattering, skin
  texture, hair masses, wet eyes and material-specific brushes.
- **The five-pass pipeline** — the whole method in one table, plus the rule:
  every pass stays reversible.
- **The 30-minute fix** — diagnose proportion, perspective or line weight
  before redrawing, and turn the repeating mistake into the next drill.

**Corrections from the fact-check** (the source material had a few errors): the
brush library is documented as over 47,000 types and 23,000 materials, not
hundreds; CMYK export needs the PSD file type and a paid plan, and PNG cannot
carry CMYK; the stabiliser's useful range is not "8–15"; frame-by-frame
animation is described without inventing an FPS ceiling; and the gesture list
now uses the documented undo/redo and canvas gestures.

**Pocket 2DCanvas grew into a one-drawing handbook**, following the same pattern
as Pocket Studio: plain-English words (thumbnail, flats, value, cel shading,
alpha lock, export size), a beginner start-here card, a **one-drawing day plan**
with a live clock, **four drawings that fit in a day** (portrait bust, prop
sheet, environment thumbnail, character silhouette) with keep/cut lists, the six
ways a drawing day dies, a twenty-minute posting walkthrough, and a
**not-today list** that persists.

Every new number is listed with its source under **2D art** in the Vault, and
eighteen new terms (value, flats, terminator, subsurface scattering, screentone,
moiré, dpi, CMYK and more) are in the glossary.

---

## What is new in 3.0.5

**Studio has a Build desk.** A new page in Studio's sidebar (between Design and
Market) for the doing half of development:

- **The 15-minute drill** — a guided timer that walks through four passes:
  locomotion and snappiness, attack cadence and cancel windows, hit weight and
  hit-stop, and camera framing. Each phase shows its own steps; the timer moves
  on by itself when a phase runs out.
- **A frame-data lab** — type the frames you counted (or start from the four
  presets) and see the move in frames *and* milliseconds, including where the
  cancel window opens. A separate hit-stop calculator covers the light, heavy
  and finisher bands, and an input-buffer calculator shows the recommended
  0.15–0.25 s window at 30, 60 and 120 FPS.
- **The six-phase build pipeline as checklists** — setup, arena greybox,
  character and layers, input and animation, camera, and juice. They stay
  ticked between sessions, like every other checklist in the app.
- **An anime-look reference table** — the URP, lighting, shadow and volume
  settings that make cel-shaded art read, with the reason beside each value.

**A fourth Learn guide: Building an action game.** A start-to-finish path for a
third-person action game in Unity 6: reading reference like a designer (the
frame-counting protocol), whiteboxing combat in 15-minute blocks, the action
controller with paste-ready C# (input buffer, movement, hitbox activation,
hit-stop), the hitbox / hurtbox / pushbox architecture and layer matrix,
animation events and cancel windows, Cinemachine 3 cameras and impulse, the
anime URP lighting and post-processing numbers, VFX and impact sound, profiling,
and the whole pipeline in one table. Every number is listed in the Vault under
the new **Game feel** group, and the new jargon (hit-stop, hurtbox, i-frames,
frame data and more) is in the glossary.

**Pocket Studio grew into a one-day handbook.** The Pocket Studio page keeps its
timer, warmup and checklist, and now carries everything a beginner needs for a
day:

- **Plain words** — verb, loop, greybox, build, scope and playtest, explained
  without jargon, next to a "never made a game before?" path that starts with a
  three-hour beginner loop.
- **One day, hour by hour** — eight blocks totalling 5 h 40, with a live **day
  clock**: enter your start time and the page says which block you should be on
  and how much of your day is left for breaks.
- **Four tiny games that fit in a day** — Bounce, Flap, Duel and Grab, each
  with its one verb, its loop, and an explicit *cut this* list.
- **If your tiny game has a fight in it** — the three windows of an attack
  (startup 4–8 frames, active 2–4, recovery 12–24), hit-stop timings, the
  input buffer, and five rules that make hits land. The short version of the
  action guide, linked to the full guide and the 15-minute drill.
- **Beginner traps and a twenty-minute itch.io upload walkthrough**, checked
  against itch.io's own documentation.
- **The not-today list** — a persistent checklist of the things you are
  deliberately not building today, so scope stays a decision instead of a hope.

**Smaller changes.** Studio's Home page has three new quick actions (Build and
tune, the 15-minute drill, the action guide) and its "what is inside" list now
includes Build. The top bar no longer prints the brand words next to the page
name on phones — the logo stays, the collision goes.

**Also in the source tree since 3.0.4 was published:** the week-hours card now
scales to an 8-hour axis, shows day numbers, and lets you tap any bar to log
that day (or use **Edit days** for all fourteen), with worked days, average,
best day, last-week delta, streak and days-logged stats; a timezone bug that
could report "this week" a day out in British Summer Time was fixed; Pocket
sessions can be added after the fact and a combined Practice report lives on
`#/practice`; and the cover cards show real per-tool facts.

The 3.0.5 EXE and APK are built from `app/` (also mirrored to
`desktop-src/app/` and `mobile-src/www/`).

---

## What is new in 3.0.4

**Templates and the glossary are Studio-only again.** The Vault is shared by
every tool, but its **Templates** and **Glossary** tabs are planning material
for Studio's work, so they only appear in Studio's vault. Every other tool's
vault keeps Backups, Notes, Sources and Settings, and says where the rest
lives.

**Every Pocket timer has a Finish button.** **Start / Pause · Finish · Reset** —
Finish ends the session immediately and logs the time actually spent, rounded to
the nearest minute. An untouched timer has spent nothing, so Finish simply
tells you to start rather than logging a session that never happened.

**Session logs can be edited.** Every entry in a Pocket log now has a ✕ to
delete it, and there is a **Clear the whole log** button. Deleting an entry
takes its minutes out of the practice totals straight away.

**The sidebar no longer jumps to the top.** Rebuilding the navigation used to
reset its scroll position, so tapping **Learn** or **Vault** — the two items at
the bottom of the sidebar — scrolled the list back to the top underneath you.
The position is preserved now (and the tab bar kept its position too).

**Moodboard and references are clearly separate per tool.** Each learning
tool's design document has its own references, labelled with the tool's name
and stating plainly that they never appear in Studio's moodboard or another
tool's references. Studio's moodboard stays per project, exactly as before.

**Images that went missing are fixed.** Three real bugs sat behind this:
- The moodboard's size badge was being overwritten with the size of the
  **entire** image store, so one small reference could read as "13 MB". The
  badge now shows that board's own size and pin count; the app-wide total is in
  the tooltip and in Settings.
- A failed image lookup was cached as a permanent miss, so a picture that could
  not be read once (the store still opening, a blocked transaction) stayed
  hidden for the whole session. Only a genuine "record does not exist" is
  remembered now; transient failures are retried.
- **Delete every stored image** removed moodboard tiles and cleared the store,
  but left every tool's image references pointing at files that no longer
  existed — so the references were still listed with nothing behind them.
  It now lets go of design references as well, in every tool.

---

## What was new in 3.0.3

**The Vault is on every tool.** Music, 3DFoundry, 2DCanvas, Story and the
Pocket tools each carry **Vault** in their own sidebar and tab bar, so
Backups, Notes, Templates, the Glossary, Sources and Settings are one tap away
wherever you are. It is the same vault, with the same data, whatever page you
open it from.

**Studio has a practice card and a practice plan.** The Studio home now shows
**Practice this week** — minutes from finished Pocket sessions across *every*
Pocket tool, against a weekly target. It appears whether or not you have made a
project yet. A new **Practice** page in the sidebar carries the same weekly
target and a list of small, finishable items, exactly like the practice plan
inside each learning tool — because the whole toolbox is the practice.

**Design pages take image and colour references.** Every learning tool's
**Design** document now has a **References** card: pin pictures from your
device, pick colours, view any of them full screen, and remove them. Pictures
go into the same full-size image store as the moodboards, so identical files
are stored once and shared; a reference is only deleted when nothing else —
no moodboard, no other design — is using it. References are listed in the
exported markdown.

---

## What was new in 3.0.2

**The reference pages are their own pages now.** Ear training, the practice log,
game export, the modifier reference, the Ibis Paint tool guide, daily drills,
the critique checklist, the outline builder, quests and branching, and the
writing exercises used to open *inside* the Learn page, with the lesson menu
still around them. Each one is now a standalone page: no lesson menu, a **Tool**
label, and a way back to the lessons at the top and the bottom. The Learn menu
lists only the curriculum and says where the reference pages live.

**A tool switcher, wherever you are.** The top bar has a **Switch tool** button
(and the sidebar has the same, next to **All tools**). It opens a flat grid of
everything — Studio, Music, 3DFoundry, 2DCanvas, Story and all five Pocket
tools — so you can jump from, say, a Music lesson straight to Pocket 3DFoundry
in one tap. The cover is in the same grid.

**Broken characters in the Vault are fixed.** A handful of dashes and quotes in
the Templates and Sources headings had been mangled into a garbled sequence of
characters by an earlier text rewrite. They are back to proper em dashes and
quotes, and the regression test now fails if any double-encoded text ever
reappears.

**A regression suite ships with the source.** `desktop-src/tools/verify.js`
runs a real renderer and checks the things that have broken before: the
fullscreen cover and its transition, the per-tool name, logo and sidebar, the
tool switcher, the standalone tool pages, the image store (totals, dedupe,
sharing, zip round trip), printing, the browser performance settings and the
Pocket timers. Run it with `npx electron tools/verify.js`.

---

## What was new in 3.0.1

**The cover is a proper front door.** It now opens fullscreen — no sidebar, no
top bar, no tab bar — and stepping into a tool fades the app chrome back in
around the page you picked. The cover is still what you land on at launch.

**The app wears the tool you are in.** The name and logo at the top follow the
tool: Studio shows its three-line mark, Music shows the note, 3DFoundry the
cube, 2DCanvas the shapes, Story the book — and the Pocket tools show their
own simplified marks with a **Pocket** prefix.

**The sidebar (and the tab bar) change with the tool.** Studio keeps its
eight sections. Each learning tool gets **Home, Plan, Design, Learn**, plus its
own reference pages — Ear training and Practice log for Music; Game export and
Modifier reference for 3DFoundry; the Ibis Paint tool guide, Daily drills and
the Critique checklist for 2DCanvas; the Outline builder, Quests and branching
and Writing exercises for Story. The Pocket tools get a session page and a log.

**A button back to the cover, always in reach.** There is an **All tools**
button at the top of the sidebar and a matching button in the top bar, on every
page, whatever the tool.

**The Pocket timer no longer reloads the page.** Tapping a preset, starting,
pausing, resetting or moving a warmup step used to redraw the whole screen.
Only the card you touched repaints now — the rest of the page stays exactly
where it was.

**Every learning tool is now a small workspace, not just a lesson list.**
- **Home** — your progress, this week's practice minutes against a target you
  set, the next exercise to do, and short cuts to everything else.
- **Plan** — a practice plan with a weekly minutes target. Only *finished*
  Pocket sessions count towards it, so the number stays honest.
- **Design** — a short, tool-specific document: instrument palette and
  structure for music, poly budget and export settings for 3D, light and
  palette for 2D, premise and five beats for writing. Exportable as markdown.
- **Learn** — every section, with its lessons, tips, checklist and exercises.
- **Tools** — the quick references, kept out of the way until you need them.

**The Vault grew a shelf for each discipline.** There are new document
templates for **2D art** (piece plan, daily drill log), **3D art** (asset brief,
export checklist), **music** (track brief, session log) and **writing** (scene
card, character sheet), and the Templates tab is grouped by tool. The Sources
tab has a matching set of new, labelled references for music (sample rate,
loudness standards), 3D (glTF, engine axis conventions, texel density), 2D
(official Ibis Paint help, value and proportion references) and writing
(structure, scene turns, branching practice).

---

## What was new in 3.0

**The app is now SoloDev Toolbox.** The old Studio is still here, complete and
unchanged — planning, the design document, market research, the marketing plan,
the calculators and the three guides. Five tools now share the front door.

**A cover screen, on every launch.** Studio is the largest card; Music,
3DFoundry, 2DCanvas and Story sit under it at equal size. Below them is a
**Pocket** row: Pocket Studio, Pocket 2DCanvas, Pocket 3DFoundry, Pocket Music
and Pocket Story. Every tool opens with one tap, and every page has a way back
to the cover — the brand in the top bar, or the **← All tools** button.

**Four learning modules, built around the real workflow of the software.**

- **Music (REAPER)** — setup and workflow, tracks, routing and FX chains, MIDI
  editing, theory that pays off, arrangement, mixing, mastering, instruments and
  sound design, game-music loops, ear training and a practice log.
- **3DFoundry (Blender)** — interface and shortcuts, modelling, topology and
  UVs, materials and texturing, sculpting, rigging and animation, lighting and
  rendering, FBX/glTF export, a modifier reference and a practice ladder.
- **2DCanvas (Ibis Paint X)** — fundamentals, colour theory, composition, a
  full tool guide (layers, clipping, blend modes, brushes, selection, rulers,
  symmetry, stabiliser), gesture and anatomy, lineart, colouring and shading,
  backgrounds and perspective, character design and appeal, daily drills and a
  critique checklist.
- **Story** — structure frameworks, characters and arcs, worldbuilding, an
  outline builder, dialogue, pacing and themes, quests and branching narrative,
  and writing exercises.

Each module has lessons, tool-specific tips, a persistent checklist and
exercises you tick off; progress is saved with everything else. No marketing
tools anywhere in them.

**Pocket tools.** Stripped-down versions of all five, with one goal: finish
something today. Each has the essentials only, a five-step plan, a checklist,
and two systems that do the real work:

- **Session timer** — 1 minute to 8 hours (presets plus a custom value),
  start / pause / resume / reset. It keeps counting while you move around the
  app, survives closing the app, and on Android posts a notification when the
  time is up. Finished sessions are logged per project.
- **15-minute warmup** — a guided, timed sequence that totals exactly fifteen
  minutes and is tailored to each tool (gesture and value drills for 2D,
  hotkey and navigation drills for 3D, ear training and a groove for music,
  five beats and a scene for story, scoping for Studio).

Pocket rules: no AI generation of any kind, no character creators, base meshes
only, and one session, one finished thing.

**New branding and a new icon set.** The Toolbox mark is a green toolbox on a
mint tile. The Android launcher uses a full-bleed adaptive icon with a
monochrome layer for themed icons, every mipmap density is replaced, and there
is a 512-pixel store icon. The Windows icon, the window icon, the app title and
the splash screen all follow. Each module's own logo appears in its page
header, and Studio keeps its three-line mark.

The logos are **editable SVG** in `app/assets/brand/`. To regenerate every icon
from them:

```text
cd desktop-src
npm install
npx electron tools/export-icons.js ..
```

That rewrites the desktop icon, all Android mipmaps (including monochrome), the
store icon, the native splash screens, and multi-size PNGs into
`app/assets/brand/export/`.

**Cross-moodboard references.** Inside any moodboard, **Import from another
board** links pictures from any other project's board. Images are linked by id,
never copied, and identical files are recognised by content hash, so a picture
is stored once however many boards use it. A shared picture is only deleted
when the last board lets go, and shared tiles say so.

**Export and import all stored images.** Settings → Stored images now packs
every picture plus a `manifest.json` (metadata, hashes and the board pins) into
one zip, and reads it back with duplicate detection, a progress bar and a
per-file error list. Missing projects are recreated so the boards have a home.
On Android the zip goes to the system share sheet; everywhere else it downloads.
(3.1.2 later gave every export a destination picker — see the top of this file.)

**Bug fixes.**

- **Stored image total** — the size readout was never filled and could
  under-count. It now sums the real size of every stored file, counts each one
  once, updates instantly on add, delete and import, and shows KB/MB/GB.
- **Print buttons** — they called `window.print()`, which does nothing in
  Electron and nothing at all in a WebView. Printing now goes through Electron's
  print dialog on the desktop, a native Android print plugin (which can also
  save a PDF) in the app, and the browser dialog on the web.
- **Browser settings** — the performance card was a dead end that just pointed
  at browser settings. It now reports the real acceleration state, offers a
  working frame-rate check, and the reduce-effects switch applies immediately.

**Also in 3.0:** the design document opens at 0 of 13 for a new project, the
Technical limits targets are editable, campaign phases can be added, edited,
deleted and reordered with their own checklists, and logging hours updates the
week card in place instead of redrawing the page.

---

## What was new in 2.3.1

**Campaigns are yours to shape.** Each phase now carries its own checklist, so
you can build the marketing plan around your game instead of the other way
round. From **Marketing → Campaign** you can:

- **Add your own phase** — a name, a when, a single job and a checklist — with
  or without starting from the template
- **Edit any phase**: rename it, change its timing and job, and add, rename or
  remove checklist items
- **Delete a phase**, or **move it up and down** to reorder the campaign
- **Collapse and expand a phase** by tapping it

Collapsing used to work only if you left the page and came back, a phase you
wrote yourself had no checklist, and renaming a phase quietly orphaned its
ticks. None of those is true now. Campaigns saved by an earlier version are
converted automatically, and the six-phase template is still one button.

**Logging hours no longer reloads the page.** The +1h, +2h, +4h and −1h buttons
used to redraw the whole screen, which flashed and threw away your place. They
now update the week card in place: the total, the meter and the ring change
while everything else stays exactly where it was.

**The week ring tells you where you are at a glance.** It had been drawn behind
a stylesheet rule pointing at a gradient that did not exist, so the coloured arc
never appeared and the ring sat grey no matter how many hours you logged. It now
fills as the week builds, and recolours as you cross your target (amber) and
your ceiling (red).

**Tapping a button no longer flashes a blue box.** Android's WebView was drawing
its default tap highlight over every control. It is switched off; the app's own
pressed states remain.

**A new project starts with nothing filled in.** The design document had been
counting borrowed starter content — a palette, some technical figures, three
rules and the core loops — as work you had done, so a brand-new project opened
at "4 of 13 parts filled in". It now opens at 0 of 13. The starter material is
still offered on each page, as a button or a suggestion, so you never face a
blank screen.

**Technical limits: "Starter value" is now "Target value", and it is editable.**
Set your own target on any row and the status column compares your numbers
against it, not against a fixed example.

**The logo is always on screen.** On a wide window the brand sits in the
sidebar. Once the sidebar turns into a drawer (a narrow window — and, since
3.1.0, the Android app, which earlier builds went without), the same mark and
wordmark also appear in the top bar, so the app is always identifiable at a
glance.

**A new icon everywhere.** The old icon placed a small "S:D" badge inside a
green square, so launchers showed it boxed in the middle of a circle. The icon
is now the app's own three-bar mark — green, purple and orange — drawn
full-bleed on a soft mint tile. It is used on the Windows `.exe` file itself,
on the app window, on every Android launcher icon (adaptive, round and the
older flat ones), and the Android splash screen now shows the same mark on the
app's dark background.

**Dialogs keep clear of the system bars.** On Android 15 and later the app
draws edge to edge. The bottom of a dialog — such as **New game project** — was
landing under the navigation bar, which put the confirm button somewhere
awkward to reach. Dialogs now respect the status bar and the navigation bar,
and their height is capped to the space that is actually left, so the actions
always stay in reach.

**Also fixed:** the page no longer redraws when you log hours from the Plan
page, and the worked example project still fills in its starter design content
on purpose.

---

## What was new in 2.2.8

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
(In 3.1.0 every sidebar section gained its own tab, so the bar now carries ten or
eleven on the learning tools and splits into two balanced rows on small phones.)

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

You land on the **cover** every time the app opens. Pick a tool from there.

1. **Studio** — open **Plan** and make your first project. It takes a minute.
2. **Studio** — read the first guide, then fill in the design pitch.
3. Pick one learning tool and do fifteen minutes of it a day. Each one has its
   own **Home**, a **Practice** plan with a weekly minutes target, a **Design**
   document for the piece you are making, and **Learn** for the lessons and
   exercises.
4. Short on time? Open a **Pocket** tool, choose a session length, run the
   15-minute warmup and finish something today.
5. When you have something worth showing, come back to **Studio → Market** and
   then **Marketing**.

To see what a filled-in project looks like, open **Vault → Backups → Add the
example project**. It seeds a complete worked example: a design document, tasks,
milestones, market research, wishlist history, a moodboard and a marketing plan.

---

## Your data

Everything is stored locally — in local storage on the web and desktop builds,
and in app-private storage on Android. There is no cloud and no account.

**Save a backup from the Vault after every milestone.** One JSON file contains
every project, design document, task, moodboard, note, marketing plan, module
progress and Pocket session log. It moves cleanly between the desktop and
Android builds.

When you save anything out — a backup, the images zip, a template — the app
asks **where**: the Windows build opens a real **Save as** dialog starting in
your Downloads folder, the Android build opens the system file picker so you
choose the folder and the filename, and a browser uses its own save flow. Every
export stays on your device; nothing is uploaded or sent anywhere.

Moodboard pictures are stored separately at full size. Use
**Settings → Stored images → Export all images (.zip)** to take those with you
as one file; the zip includes a manifest of which board each picture was pinned
to, and importing it back rebuilds the boards.

Data from version 1 is picked up and converted automatically. Every upgrade
since has been additive — nothing you have made is rewritten or lost — and the
Windows data folder keeps its original name (`%APPDATA%\SoloDevStudio`) so the
3.0 rename cannot orphan it.

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
npm run dist        # produces dist/SoloDevToolbox-<version>-portable.exe
npm start           # or run live from source
npm run smoke       # headless test: renders every screen, reports errors
npx electron tools/export-icons.js ..   # regenerate icons from the SVGs
npx electron tools/verify.js ..         # regression tests in a real renderer
```

The smoke test renders every screen — Studio's sections, the cover, all four
learning modules, the Pocket tools — in both empty and filled states, plus every
design section, every calculator, the moodboard and the image viewer. It exits
non-zero if anything throws.

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
  either sourced or labelled as a model. The Pocket tools forbid AI generation
  outright: no generated 2D art, 3D models, music or story, and no character
  creators — base meshes only.
- The four learning modules are **reference material for the software they
  teach** (REAPER, Blender, Ibis Paint X, plain writing). They are written to be
  true and useful, not to be a substitute for the official documentation. Where
  a version changes a menu, the shortcut and the idea still hold.
- Module progress and Pocket session logs are kept in the same local store as
  everything else, and travel in the same backup file.
- Images you add to a moodboard are stored inside the app and are counted once,
  however many boards share them. The Settings page and the moodboard both show
  how much is in use, and a picture is only removed when the last board using it
  lets go — or when you delete them all on purpose.
