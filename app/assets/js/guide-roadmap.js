/* ==========================================================================
   LEARN — Guide 1: Making games on your own without burning out
   Plain-language rewrite of the studio strategy document.
   ========================================================================== */
(function () {
  'use strict';
  var App = window.App;
  App.guides = App.guides || {};

  App.guides.roadmap = {
    id: 'roadmap',
    label: 'Making games solo',
    title: 'Making games on your own without burning out',
    tag: 'Strategy · Money · Time · Staying sane',
    deck: 'This is the plan for building games as one person: how long things really take, what you actually earn, what to reuse, when to release, and the five rules that stop you collapsing in year three.',
    sections: [
      {
        id: 'rd-realistic',
        title: 'What is actually realistic',
        blocks: [
          { t: 'lead', x: 'Four separate research passes all landed on the same conclusion: **your first games should teach you the whole process, not try to be a hit**. The thing that decides whether you are still making games in three years is not your art quality. It is whether your process can survive being repeated.' },
          { t: 'p', x: 'The developers who make it are not the ones with the best first game. They are the ones who build a **reusable way of working** — shared code, shared character rigs, shared tools — and then keep using it. That is what turns a 14-week game into a 10-week game, and then into an 8-week game.' },
          { t: 'p', x: 'The documented way solo developers fail is not bad code. It is trying to be the programmer, the artist, the marketer and the community manager all in the same week, and then doing it again the next week, and the next.' },
          { t: 'academic', title: 'Is the plan realistic?', summary: 'Partly — **but only if the first two or three years are treated as learning and building your toolkit rather than trying to maximise sales**. The three risks are: the game quietly getting bigger, the marketing work you cannot see, and running out of energy.', rows: [
            { score: 8, level: 'strong', label: 'Strong', claim: '**Starting small protects you.** Successful solo developers did not begin with large or complicated games.' },
            { score: 8, level: 'strong', label: 'Strong', claim: '**Playing the long game matters more than growing fast.** The failure mode is doing every job at once.' },
            { score: 6, level: 'moderate', label: 'Moderate', claim: '**Year 2 to 3 is the danger zone.** Exhaustion climbs when workload and life interfere and there is no recovery time.' },
            { score: 9, level: 'strong', label: 'Strong', claim: '**Reusing your own work compounds.** Shared rigs and systems can cut 60–75% off the time your next game takes.' }
          ] }
        ]
      },
      {
        id: 'rd-ramp',
        title: 'A four-year plan that actually fits',
        blocks: [
          { t: 'p', x: 'The first year is not about earning money. It is about learning the tools until you do not have to think about them, so that in year three you can build fast without getting stuck.' },
          { t: 'table', head: ['When', 'What you are really doing', 'What you finish', 'Why'], rows: [
            ['Months 1–2', 'Learning the basics properly', 'Comfortable with one engine, one modelling tool, and rigging. No commercial project yet.', 'Getting stuck on basics later costs far more'],
            ['Months 2–4', 'Making throwaway things', 'Three to five tiny prototypes, each one or two weeks, plus one game jam', 'You learn faster by finishing small things'],
            ['Month 4', 'Choosing the first real game', 'Scope locked small, and the Steam page published the moment the art style is decided', 'The store page collects wishlists while you build'],
            ['Months 4–11', 'Building and shipping it', 'Full game, reusable systems, outside playtesting, released into a busy season', 'This is the real rehearsal for everything after'],
            ['All the time', 'The big game, quietly', 'Two to four hours a week on writing and worldbuilding only. No code, no production.', 'It keeps the idea alive without stealing time']
          ] },
          { t: 'h', x: 'Year two onwards — the snowball' },
          { t: 'list', items: [
            '**Year 2: two small games.** Because you reuse 60–80% of the code and rigs, each one takes 10–14 weeks instead of 14+. In the last months you start quietly planning the medium game.',
            '**Year 3: two small games plus one medium game.** This is the year that decides everything. The small games pay the bills and keep your store page active; the medium game builds your name.',
            '**Year 4 and after: the steady state.** Two or three small games a year, one medium game every 12–18 months, and the big game whenever it is ready. A realistic long-run average is **three or four releases a year**.'
          ] },
          { t: 'callout', kind: 'warn', title: 'The arithmetic that catches everyone', x: 'Try to fit two or three small games (8–18 weeks) plus finishing a medium game (26–39 weeks) into one year and you can reach **57 weeks of production time inside a 52-week calendar**. That is not a scheduling problem, it is arithmetic. The rule that fixes it: **only one game is in full production at a time**. Everything else waits, doing paperwork and design work, until the active game is out.' },
          { t: 'callout', kind: 'gold', title: 'Five releases a year is a ceiling, not a target', x: 'To release five things a year, every one of them must share 90% of its code and art. Also: "no hiring" is a cash-flow decision for the first few years, not a philosophy. Once you have a back catalogue, paying a sound designer, a trailer editor or a tester is how you get more done without giving up ownership of the game.' }
        ]
      },
      {
        id: 'rd-money',
        title: 'What you actually earn',
        blocks: [
          { t: 'p', x: 'The price on the store page is not what you get. Steam takes its cut, tax comes off, some people buy at a lower regional price, and some ask for refunds. Plan with the real number, not the headline price.' },
          { t: 'table', head: ['Kind of game', 'Price', 'Made by hand → hours played', 'Genre', 'You keep per copy', 'Copies to make $15k'], rows: [
            ['Small', '$6.99', '3–4 h → 15–40 h', 'Roguelite, survivors-like, arcade', 'about $3.60', 'about 4,166'],
            ['Medium', '$14.99', '4–8 h → 10–25 h', 'Tactical RPG, action RPG', 'about $7.20–$10.50', 'about 1,785'],
            ['Big', '$22.99', '12–15 h → 20–50 h', 'Episodic story RPG', 'about $12.00–$15.50', 'about 1,110']
          ] },
          { t: 'code', title: 'How much of the price you keep', code: 'Money you keep = Copies × [ Price × Regional × (1 − Refunds) × (1 − Tax) × (1 − Steam cut) ]\n\nRegional   ≈ 0.68–0.72   people in poorer countries pay less\nRefunds   ≈ 0.08–0.12   short games get refunded more\nTax       ≈ 0.08–0.12   VAT and sales tax\nSteam cut  = 0.30       the platform\'s share' },
          { t: 'h', x: 'Guessing how many copies a similar game sold' },
          { t: 'p', x: 'There is a rough trick: **copies ≈ number of reviews × a number between 20 and 65**. The multiplier depends on genre and price. It is only a guess — sales and bundles distort it badly — so always look at 8 to 15 similar games and use the **middle number**, not the biggest.' },
          { t: 'table', head: ['Kind of game', 'Multiply reviews by', 'Why'], rows: [
            ['Strategy and tactics', '20× – 30×', 'These players leave reviews often.'],
            ['Action roguelite / survivors-like', '30× – 42×', 'The standard benchmark.'],
            ['Story-heavy RPG', '25× – 35×', 'Emotional attachment drives reviews.'],
            ['Casual and cheap', '45× – 65×', 'Casual players almost never review.']
          ] },
          { t: 'quote', x: 'Dollars per hour of playtime is a dead idea. Players pay for how deep a game feels and how good it looks, not for how long it is.', cite: 'Steam pricing analysis' },
          { t: 'verdict', tag: 'What to do about it', x: 'Indie games are almost always priced too low. **Price at the top end of games of similar quality, never the bottom.** Then earn that price by making the game feel deep.' }
        ]
      },
      {
        id: 'rd-reuse',
        title: 'Build things you can use again',
        blocks: [
          { t: 'p', x: 'Everything you make should be a building block for the next game. This is the single biggest advantage one person has over a studio: you never have to re-explain your own code to anyone.' },
          { t: 'h', x: 'Blender and Unity conventions' },
          { t: 'list', items: [
            '**One skeleton, forever.** Same bone names on every character, so animation can be shared between characters with no manual fixing.',
            '**A kit of parts.** A few base heads and bodies with swappable hair, clothes and accessories, all sharing one texture layout.',
            '**One toon shader per kind of game.** A bright two-tone one for small games, a painterly one for medium games, a high-contrast one for the big game. Different looks, same geometry.',
            '**Trim sheets everywhere.** They keep the number of separate draw calls low and the look consistent.',
            '**One Blender unit = one Unity metre.** Pivot at the origin, every time. Never fix coordinates on import.'
          ] },
          { t: 'h', x: 'The shared code package' },
          { t: 'table', head: ['Piece', 'What it does', 'Reusable?'], rows: [
            ['Input and rebinding', 'Controller detection, button prompts, letting players change keys', 'Completely'],
            ['Save and load', 'Saving safely, cloud saves, recovering from a corrupted save', 'Completely'],
            ['Audio mixer', 'Separate volumes for sound, music and interface, plus ducking and effects', 'Completely'],
            ['Localisation', 'Text stored by key, ready for other languages', 'Completely'],
            ['Roguelite meta progression', 'Upgrade drafting, seeded runs, permanent unlocks', 'Re-skin per game']
          ] }
        ]
      },
      {
        id: 'rd-genre',
        title: 'Which genres suit one person',
        blocks: [
          { t: 'cards', items: [
            { title: 'Small games — the arena', badge: 'la', x: 'Stay in **3D arena roguelites, survivors-likes or roguelike deckbuilders**. One modular environment plus a dozen enemy types, combined with upgrade drafting, turns into 20–40 hours of play. Each new game changes the setting and the upgrades — never the physics.' },
            { title: 'Medium games — turn-based tactics', badge: 'lb', x: 'The numbers favour **turn-based or tactical combat** for one person: far fewer transition animations, no physics or network bugs, and lots of room for story. Real-time action is possible but multiplies the animation and testing work.' },
            { title: 'Big games — short episodes', badge: 'lc', x: 'Do not try to build one enormous 40-hour RPG. Build **separate episodes that each stand alone**. Each one follows one character, reuses the same backend, and tells a complete story.' }
          ] },
          { t: 'callout', kind: 'warn', title: 'Never build multiplayer', x: 'Networking, synchronisation, lag compensation, servers and cheats are enormous risks for one person. Almost every "we had to shut down" story in indie games starts with "we added multiplayer".' }
        ]
      },
      {
        id: 'rd-calendar',
        title: 'When to release things',
        blocks: [
          { t: 'p', x: 'If you release two games close together, the second one eats the first one\'s attention. Space them out so each gets its own two weeks in the spotlight.' },
          { t: 'table', head: ['Month', 'Small game work', 'Medium game work', 'Steam event'], rows: [
            ['January', 'Fixes for the winter release', 'Lock the content, start testing', '—'],
            ['February', 'Prototype the next one', 'Lock the festival demo', 'Next Fest (Winter)'],
            ['March', 'Build it', 'Festival feedback and testing', 'Spring Sale'],
            ['April', 'Test it, cut the trailer', 'Store marketing and outreach', 'Themed festival'],
            ['May', 'Store page and demo prep', 'Final build', '—'],
            ['June', 'Summer festival', 'Prepare the press embargo', 'Summer Sale'],
            ['July', 'LAUNCH the small game', 'Do nothing — no overlap', '—'],
            ['August', 'Support the small game', 'LAUNCH the medium game', '—'],
            ['September', 'Start the next small game', 'First patch', 'Autumn festival sign-up'],
            ['October', 'Build it', 'Wind down', 'Next Fest (Autumn)'],
            ['November', 'Test and add achievements', 'Plan next year', 'Autumn Sale'],
            ['December', 'LAUNCH into the winter sale', 'Rest properly', 'Winter Sale']
          ] },
          { t: 'callout', kind: 'info', title: 'The Steam rules that catch people out', x: '**Discounts need 30 days apart.** Valve enforces this. Your launch discount (10–15% for about a week) must finish at least 30 days before a big seasonal sale or you cannot take part. **Demos need to be ready early.** Valve needs about a month; plan for seven weeks. **Festival placement depends on what you already have.** Going into a festival with three to five thousand wishlists gets very different treatment to going in cold.' }
        ]
      },
      {
        id: 'rd-marketing',
        title: 'Who you are talking to',
        blocks: [
          { t: 'table', head: ['Kind of game', 'Who plays it', 'Where they are', 'What to post'], rows: [
            ['Small', 'Casual players, people who watch streams, roguelite fans', 'TikTok, YouTube Shorts, Twitch', 'Very short clips of satisfying moments, funny deaths, upgrade combos. Festivals.'],
            ['Medium', 'RPG fans, people who like character art', 'YouTube devlogs, medium streamers, Discord', 'Character reveals, how the combat works, closed playtests, behind the scenes.'],
            ['Big', 'Players who care about story and lore', 'Long YouTube videos, newsletters, email', 'A slow 12–18 month wishlist campaign, essays about themes, music previews.']
          ] },
          { t: 'callout', kind: 'gold', title: 'Tell the story of making it, not just the game', x: 'Before you have a demo, post about the **process**: the mistakes, the shader attempts, the physics breaking. It builds an audience of other developers and early players — and it makes working alone feel much less alone.' }
        ]
      },
      {
        id: 'rd-story',
        title: 'Stories that survive long gaps',
        blocks: [
          { t: 'p', x: 'If there are years between your games, do not write one long continuing story. No one remembers the details, and new players feel shut out. Instead, put every game in the **same universe but make each one stand alone**.' },
          { t: 'list', items: [
            'Every release is complete on its own — anyone can start anywhere.',
            'All the games share the same world rules: how magic works, what the ruins are, who the gods were.',
            'Long-time fans get rewarded with background details, recurring groups and familiar creatures.',
            'The same creature models get reused with new skins between games — enemies in one become wildlife in another.',
            'Logos and brands from the story game show up as stickers on walls in the action games.'
          ] },
          { t: 'pins', score: 8, max: 10, level: 'strong', label: 'This is what makes a long series survive commercially' }
        ]
      },
      {
        id: 'rd-burnout',
        title: 'The five rules that keep you alive',
        blocks: [
          { t: 'p', x: 'Working alone means constantly switching between coding, art, sound, community and admin. That switching is what actually exhausts people. These are boundaries, not willpower.' },
          { t: 'list', items: [
            '**1. One game in production at a time.** Never run two releases at once. The others wait in the background doing design work only.',
            '**2. A weekly ceiling of 35 to 40 hours.** Long weeks produce mistakes and technical debt, not progress.',
            '**3. Always add 25% to every estimate.** The buffer is for things going wrong and for resting. It is never for extra features.',
            '**4. Keep making days and managing days separate.** Do not mix 3D modelling and code refactoring with social media and admin in the same day.',
            '**5. The two-week rule.** If you feel dread, your quality drops, or you stop wanting to talk to anyone for two weeks, stop completely for seven days. No exceptions.'
          ] },
          { t: 'pins', score: 9, max: 10, level: 'strong', label: 'Backed up by the workload research' },
          { t: 'callout', kind: 'warn', title: 'Being successful does not protect you', x: 'The developer of *Only Up!* had a viral hit and then took the game down entirely because of the pressure. Protect your head before you protect the numbers.' }
        ]
      },
      {
        id: 'rd-market',
        title: 'What the market looks like right now',
        blocks: [
          { t: 'p', x: 'Checked against reporting from September 2026. More games are released every year, which is exactly why scope and execution matter more than volume of content.' },
          { t: 'stats', items: [
            { k: 'Games released on Steam in 2026', v: '16,000+', s: 'about 70 every day' },
            { k: 'Demos in the June festival', v: '4,300+', s: 'the biggest one yet, up 66%' },
            { k: 'Typical indie lifetime earnings', v: 'under $3k', s: 'almost all revenue goes to a few games' },
            { k: 'Megabonk', v: '1M+ in 14 days', s: 'made by one person in 2025' }
          ] },
          { t: 'list', items: [
            '**70 games a day** means your first game is training, not a payday. Treat it that way and you will not be crushed.',
            '**Median earnings under $3,000** means the only things you control are how cheap your game is to make and how replayable it is.',
            '**Festivals are crowded now.** They amplify an audience you already have far more than they create one.',
            '**The Megabonk example is real.** One person with a survivors-like can still break out at enormous scale.'
          ] },
          { t: 'verdict', tag: 'The conclusion', x: 'Being fast and making something people want to replay beats having more art.' }
        ]
      },
      {
        id: 'rd-decisions',
        title: 'Two decisions you will have to make',
        blocks: [
          { t: 'callout', kind: 'gold', title: 'Decision 1 — learning project or commercial game?', x: 'A linear platformer is a great way to learn an engine, but it is the opposite of a systems-driven game you can reuse. Use it as your **sandbox**. Learn the movement, the camera and the modelling. Then build your first commercial game as a run-based arena game, reusing the movement code and dropping the levels.' },
          { t: 'callout', kind: 'info', title: 'Decision 2 — using AI tools', x: 'Never put generated code you do not understand into the core of your game. Use AI to explain error messages, review changes and break big tasks into small ones — not to produce whole systems you cannot debug at launch week. **If you cannot fix it under pressure, you do not own it.**' }
        ]
      }
    ]
  };
})();
