/* ==========================================================================
   SoloDev Studio — content
   Plain-language labels, the 10-step game plan, checklists, calculators data,
   market references, marketing playbooks and the glossary.
   Everything here ships with the app and works offline.
   ========================================================================== */
(function () {
  'use strict';
  var App = window.App;

  App.data = {

    /* ====================================================================
       THE THREE KINDS OF GAME
       ==================================================================== */
    labels: {
      A: {
        name: 'Small game',
        short: 'Small',
        color: 'la',
        msrp: 6.99,
        summary: 'quick and cheap to make, sold cheap',
        net: 'about $3.60 per copy in your pocket',
        genre: 'roguelite, survivors-like, deckbuilder, arcade',
        tone: 'Light, fun, easy to explain in one sentence.',
        cadence: '6–10 weeks',
        weeks: [6, 10],
        ratio: '3–4 h of hand-made content → 15–40 h of play',
        focus: 'The systems do the work. Replayable runs, fast to build, easy to clip for social media.',
        breakEven: 'about 4,166 copies to make $15k after fees',
        why: 'These are your practice games and your cash flow. They teach you the whole pipeline — build, store page, launch, patch — without risking years of your life.',
        watchOut: 'Do not make it bigger than it needs to be. If a run stops being fun in five minutes, art will not save it.'
      },
      B: {
        name: 'Medium game',
        short: 'Medium',
        color: 'lb',
        msrp: 14.99,
        summary: 'a bigger, more careful game with characters and story',
        net: 'about $7.20–$10.50 per copy in your pocket',
        genre: 'tactical RPG, action-adventure, hub-based RPG',
        tone: 'Warm and sincere. Anyone can be a hero.',
        cadence: '6–9 months',
        weeks: [26, 39],
        ratio: '4–8 h of hand-made content → 10–25 h of play',
        focus: 'Reuse the rigs and systems from your small games, then spend the time on characters and combat depth.',
        breakEven: 'about 1,785 copies to make $15k after fees',
        why: 'This is the step that builds a reputation. Same pipeline as the small games, but the writing and tactics get real attention.',
        watchOut: 'Real-time action multiplies animation work. Turn-based is much kinder to one person.'
      },
      C: {
        name: 'Big game',
        short: 'Big',
        color: 'lc',
        msrp: 22.99,
        summary: 'the long, ambitious one you build slowly in the background',
        net: 'about $12.00–$15.50 per copy in your pocket',
        genre: 'episodic story RPG, narrative adventure',
        tone: 'Serious, with real humour. Characters facing big questions.',
        cadence: '2–3 years, built slowly alongside the others',
        weeks: [104, 156],
        ratio: '12–15 h of hand-made content → 20–50 h of play',
        focus: 'Build it in self-contained episodes so one slow year cannot sink the whole thing.',
        breakEven: 'about 1,110 copies to make $15k after fees',
        why: 'This is the game you actually want to make. It stays alive because you only give it a few hours a week.',
        watchOut: 'Never let the big game take hours away from an active small game. That is the classic way to run out of money.'
      }
    },

    /* ====================================================================
       THE 10 STEPS  (one page each, in plain words)
       ==================================================================== */
    stages: [
      {
        n: 1, name: 'Pick the idea', short: 'Idea',
        goal: 'Choose one idea to take forward — and prove people actually play games like it.',
        why: 'Most first games fail here, not in the code. Picking something nobody is searching for is the most expensive mistake you can make.',
        deliverable: 'A one-page pitch plus a quick check that similar games have players.',
        checklist: [
          'I can describe the game in one sentence a stranger would understand',
          'I found at least 5 similar games on Steam and looked at their reviews and price',
          'The similar games sell well enough to be worth copying',
          'The idea can be shown as a 3-second clip that makes sense with no sound',
          'The fun comes mostly from systems, not from hundreds of hand-made levels',
          'I sat with the idea for two days and still like it'
        ],
        tips: [
          'Write the sentence as “It is X meets Y, and the clever bit is Z”.',
          'If you cannot find any similar games, that is usually bad news, not good news.',
          'A small game with a strong hook beats a big game with no hook.'
        ]
      },
      {
        n: 2, name: 'Write the plan', short: 'Plan',
        goal: 'Lock down what you are building so you stop changing your mind every week.',
        why: 'Changing direction repeatedly costs more time than any bug. Writing it down makes the choices real.',
        deliverable: 'A short design document and three rules the game must never break.',
        checklist: [
          'Three design rules written down and agreed with myself',
          'The core loop is written as actions: what the player does, over and over',
          'Rough numbers for damage, health, money and cooldowns are on paper',
          'I wrote the technical limits: how detailed models can be, how many effects at once, target frame rate',
          'I have a rough week-by-week plan with 25% extra time added',
          'The design document lives next to the project files, not in my head'
        ],
        tips: [
          'Three rules is the right number. Five is a wish list.',
          'Write the numbers even if they are wrong. Wrong numbers can be fixed; missing numbers become bugs.',
          'The plan is a promise about scope, not about quality.'
        ]
      },
      {
        n: 3, name: 'Make it move', short: 'Prototype',
        goal: 'Get the character moving and get the first 10 minutes feeling good — with ugly placeholder graphics.',
        why: 'If it is not fun with grey boxes, nicer art will not fix it. Better to find out in two weeks than two years.',
        deliverable: 'A grey playable prototype with no real art.',
        checklist: [
          'Moving, jumping, dodging and attacking all feel right with grey shapes',
          'The camera follows, frames and shakes properly',
          'The main combat loop works end to end',
          'I played it for 10 minutes and wanted to keep going',
          'Sizes are consistent: player is 1.8 m tall, doors are 2.2 m, low cover is 0.9 m'
        ],
        tips: [
          'Spend the time on feel here. Feel is cheap to fix now and expensive later.',
          'No art. No UI polish. No menus. Just the 10 minutes.',
          'If it is boring, change the idea now. You have lost two weeks, not two years.'
        ]
      },
      {
        n: 4, name: 'Make one bit brilliant', short: 'Slice',
        goal: 'Build one small piece of the game at finished quality, so you know exactly what the rest of the work costs.',
        why: 'This is where you find out whether your art and audio pipeline actually works before you need it 40 more times.',
        deliverable: 'One finished area, one finished character, three finished enemies, real sound.',
        checklist: [
          'One complete area with final art and lighting',
          'The main character is finished and rigged properly',
          'Three enemy types finished: one swarm, one that telegraphs attacks, one tank',
          'Complete sound: footsteps, hits, weapon swings and music',
          'Feel pass done: hit pause, screen shake, flash on damage, input buffering',
          'It holds 60 FPS on a Steam Deck for 15 minutes straight'
        ],
        tips: [
          'Do not start the next area until this one is genuinely finished. Finished means you would ship it.',
          'If this piece took longer than you planned, the whole plan needs rebuilding — not the piece.',
          'Get your first outsider to play it here. Watch their hands, not their face.'
        ]
      },
      {
        n: 5, name: 'Build all the content', short: 'Build',
        goal: 'Turn the process into a factory. Adding content should need no new code.',
        why: 'A solo developer can only win by making the 20th level as cheap as the 2nd.',
        deliverable: 'All content built through a repeatable pipeline.',
        checklist: [
          'Adding a new item, enemy or level needs no new code — only data',
          'I am adding content every week and tracking how much',
          'The shared code library is reused, not copy-pasted, between projects',
          'The Steam page is live with screenshots and a wishlist button, 6–9 months before launch',
          'A playable build is produced automatically every week'
        ],
        tips: [
          'If adding content takes code, stop and build the tool first.',
          'Put the store page up early. Every wishlist is free advertising you get for existing.',
          'Ship a build to yourself every week so you always have something playable.'
        ]
      },
      {
        n: 6, name: 'Stop adding, start cutting', short: 'Alpha',
        goal: 'Everything is in the game, and the weakest 30% of it gets removed.',
        why: 'Cutting is the highest-value thing a solo developer does. Half-finished features are worse than missing ones.',
        deliverable: 'A complete but rough game, with the weakest parts removed.',
        checklist: [
          'Every planned feature is present, even if rough',
          'I scored each feature on “how much playtime did this add per hour of work?”',
          'The weakest 30% is cut, deleted, gone',
          'No new features from here. Ideas go on a list for the next game',
          'Bugs are sorted into: crashes, big, small, cosmetic'
        ],
        tips: [
          'Cutting a feature is progress, not failure. Put it in a “next game” list so you do not feel robbed.',
          'The 30% rule sounds brutal. It is not — it is what lets you finish.',
          'Once you cut, do not go back.'
        ]
      },
      {
        n: 7, name: 'Show it to the world', short: 'Demo',
        goal: 'A polished 20-minute demo, plus screenshots, a trailer and a festival slot.',
        why: 'Festivals amplify what you already have. Going in with 200 wishlists gets you almost nothing; going in with 4,000 gets you seen.',
        deliverable: 'Public demo, store page finished, festival registered.',
        checklist: [
          'The demo is a tight 15–20 minute slice you are proud of',
          'Demo and store assets submitted at least 7 weeks before the festival',
          'Five screenshots that show gameplay clearly, with no logos or menus',
          'A 60-second trailer that shows real gameplay in the first 3 seconds',
          'The five most relevant tags chosen by looking at direct competitors',
          'Outreach list of streamers and press written, with the first 20 contacted',
          'The demo end screen has a one-click Add to Wishlist button'
        ],
        tips: [
          'The first three seconds of the trailer decide everything.',
          'A tight 15 minutes beats a wobbly hour. Cut the boring middle levels.',
          'Register for the festival early. Slots and paperwork both surprise people.'
        ]
      },
      {
        n: 8, name: 'Make it feel great', short: 'Polish',
        goal: 'The game looks fine — now make it feel good to touch, and listen to your playtesters.',
        why: 'This is the difference between a 78% rating and a 93% rating, and the rating decides whether the game keeps selling.',
        deliverable: 'Polished build with playtest feedback applied.',
        checklist: [
          'Basic tracking added: where players die, which upgrades they pick, where they quit',
          'No single upgrade is picked by more than 40% of players',
          'Feel pass: input buffering, hit pause, screen shake, flash, controller rumble, sound ducking',
          'At least five outside people played it and I wrote down what they did',
          'All text is final and ready to translate',
          'I played the whole game from start to finish without a crash'
        ],
        tips: [
          'Watch where players get confused, not where they say they got confused.',
          'If one upgrade is always picked, the others are not interesting enough.',
          'Rumble, hit pause and sound are the cheapest quality you will ever buy.'
        ]
      },
      {
        n: 9, name: 'Ship it', short: 'Launch',
        goal: 'A stable build, a date, and everything ready to press the button.',
        why: 'Launch week is a wave. You want to be fixing complaints, not writing features.',
        deliverable: 'Final build ready to publish.',
        checklist: [
          'Final build frozen 14 days before launch — nothing changes after that',
          'No crashes, no save loss, no getting stuck',
          'Every menu and dialogue works with a controller',
          'Cloud saves tested on both PC and Steam Deck',
          'Achievements and stats wired up',
          'Launch discount set (10–15%) and the press embargo scheduled',
          'Launch-day plan written: who posts what, and when'
        ],
        tips: [
          'Freeze early. Every change in the last two weeks is a coin flip.',
          'Test the saves. Losing a save is the one thing players never forgive.',
          'Schedule your own posts for launch day so you are not improvising.'
        ]
      },
      {
        n: 10, name: 'Look after it', short: 'After',
        goal: 'Fix what players complain about, then plan the discounts and the next game.',
        why: 'The first 72 hours decide the review score, and the review score decides the next two years of sales.',
        deliverable: 'Patch plan, review response plan, and a written post-mortem.',
        checklist: [
          'Someone is watching the store page, Discord and email for the first 72 hours',
          'A fix can be ready and shipped within 12 hours if something is badly broken',
          'Reviews are being read and the top complaint is being fixed',
          'Discount plan written: month 3 at 20%, month 6 at 25%, month 12 at 33%, month 18 at 50% plus a bundle',
          'A written post-mortem of what went well and badly, done while it is fresh',
          'Bundles set up with my other games'
        ],
        tips: [
          'Reply politely to bad reviews. Future buyers read your replies.',
          'Never discount within 30 days of your last discount — the platform will refuse it.',
          'Write the post-mortem before you start the next game. It is the most valuable document you will make.'
        ]
      }
    ],

    /* ====================================================================
       STARTER TASKS PER STAGE
       ==================================================================== */
    starterTasks: {
      '1': ['Write the one-sentence pitch', 'Find 5 similar games on Steam', 'Check their prices and review counts', 'Storyboard the 3-second hook'],
      '2': ['Write three design rules', 'Write the core loop as actions', 'Put first numbers on paper', 'Set technical limits', 'Build the week-by-week plan with 25% buffer'],
      '3': ['Get the character moving', 'Tune the camera', 'Build the basic attack loop', 'Play for 10 minutes and note what is boring'],
      '4': ['Finish one area at final quality', 'Finish the main character', 'Build three enemy types', 'Add sound effects and music', 'Do the feel pass', 'Test on Steam Deck for 15 minutes'],
      '5': ['Put the Steam page live', 'Build the content pipeline', 'Add content every week', 'Set up weekly builds'],
      '6': ['Audit every feature for value', 'Cut the weakest 30%', 'Freeze new features', 'Sort the bug list'],
      '7': ['Finish the demo', 'Record five clean screenshots', 'Edit the 60-second trailer', 'Register for the festival', 'Contact the first 20 streamers'],
      '8': ['Add basic tracking', 'Run a feel pass', 'Playtest with five people', 'Lock the text for translation'],
      '9': ['Freeze the build 14 days out', 'Test controller support everywhere', 'Verify cloud saves', 'Set the launch discount', 'Write the launch-day plan'],
      '10': ['Set up the 72-hour watch', 'Reply to the first reviews', 'Write the post-mortem', 'Plan the discount ladder', 'Start the next project brief']
    },

    /* ====================================================================
       CHECKLISTS THAT APPLY TO EVERYTHING
       ==================================================================== */
    globalChecklists: [
      {
        id: 'ready',
        title: 'Before you commit to a project',
        items: [
          'I found 8–15 similar games on Steam and looked at their price, reviews and release date',
          'My price sits at the top of similar games, not the bottom',
          'The scope matches what one person can build — not what a studio can',
          'People actually search for the tags this game would use',
          'This does not overlap with a game I am already working on'
        ]
      },
      {
        id: 'store',
        title: 'Your Steam page, done right',
        items: [
          'Genre and the core loop are locked and will not change',
          'The screenshots show the real game, not concept art',
          'At least three different-looking areas are visible',
          'The five tags came from looking at direct competitors, not from guessing',
          'The short description says what you do, what kind of game it is, and the twist — in one breath',
          'The trailer shows gameplay in the first three seconds',
          'The wishlist button is visible on the page and in the demo'
        ]
      },
      {
        id: 'fest',
        title: 'Before a Steam festival',
        items: [
          'The demo is finished quality, not a rough build',
          'Everything is submitted at least 7 weeks before it starts',
          'A looping 1080p60 stream is ready to run',
          'The demo ends with a clear “wishlist this” screen',
          'I have a plan for replying to feedback during the week'
        ]
      },
      {
        id: 'feel',
        title: 'The feel checklist (per game)',
        items: [
          'Inputs are remembered for 120–150 ms so late presses still count',
          'Ledges are forgiving — about 100 ms of extra time after walking off',
          'Heavy hits pause the game for 4–6 frames',
          'Screen shake is based on how big the hit was, and never constant',
          'Damage flashes the character white briefly',
          'Combat sound briefly lowers the music by about 4 dB',
          'Controller rumble differs: low motor for weight, high motor for snap'
        ]
      },
      {
        id: 'launchday',
        title: 'Launch day, hour by hour',
        items: [
          'Final build checked on a real Steam Deck',
          'Launch discount live in the backend',
          'Press and creator embargo lifts a few hours before the store unlocks',
          'Announcement posted to the store page, Discord and email list',
          'Someone is reading bug reports for the first 72 hours',
          'A hotfix can go out within 12 hours'
        ]
      },
      {
        id: 'health',
        title: 'Monthly check on you',
        items: [
          'I stayed under my weekly-hour ceiling',
          'I did not work through my rest days two weeks in a row',
          'The 25% buffer is still there — nothing extra crept in',
          'Making days and admin days stayed separate',
          'Only one project was in full production this month',
          'I talked to at least one other developer'
        ]
      },
      {
        id: 'market',
        title: 'Market research you can trust',
        items: [
          'I used at least 8 similar games for every estimate, never one',
          'I wrote down where each number came from',
          'I checked the release dates — old data from a different market is not evidence',
          'I looked at the negative reviews of my competitors, not just the positive',
          'I used the median, not the average, when a few hits skew the numbers'
        ]
      },
      {
        id: 'adready',
        title: 'Before you spend money on advertising',
        items: [
          'The store page converts visitors into wishlists at a reasonable rate already',
          'I know my cost per wishlist from a small test',
          'The creative is a real gameplay clip, not a logo',
          'I set a spending limit before starting, and a stop date',
          'I am measuring sales, not clicks'
        ]
      }
    ],

    /* ====================================================================
       MOODBOARD PALETTES
       ==================================================================== */
    palettes: [
      { name: 'Deep forest', source: 'calm, natural, grown-up', colors: ['#0c3b27', '#1d7a50', '#5eead4', '#e9dfd3', '#6b4f26'] },
      { name: 'Warm paper', source: 'editorial, printed, handmade', colors: ['#f4efe6', '#1c1a15', '#d9620a', '#8a857a', '#17744a'] },
      { name: 'Summer lawn', source: 'bright, friendly, outdoors', colors: ['#2f7d32', '#8bc34a', '#f6c8d0', '#fff3b0', '#7dd3fc'] },
      { name: 'Pastel mascot', source: 'cute characters, soft humour', colors: ['#ffd9e8', '#c7f0ff', '#fff3c4', '#d9ccff', '#2b2b3a'] },
      { name: 'Neon night', source: 'fast, electric, arcade', colors: ['#0b0f1c', '#00e5ff', '#ff2d95', '#ffe600', '#7c3aed'] },
      { name: 'Field kit', source: 'tactical, readable, serious', colors: ['#2b2f33', '#8a8f98', '#c2b280', '#4f5d75', '#dbe1e8'] },
      { name: 'Empty space', source: 'cosmic, quiet, strange', colors: ['#150a2b', '#7c3aed', '#c4b5fd', '#f0abfc', '#e0e7ff'] },
      { name: 'Late harvest', source: 'autumn, warm, nostalgic', colors: ['#3a2a18', '#c2762a', '#f0b45c', '#f6e7c9', '#7a4a1f'] },
      { name: 'Cold steel', source: 'sci-fi, industrial, clean', colors: ['#10161c', '#33414f', '#7c94a8', '#c9d6e2', '#e8a33d'] },
      { name: 'Blood orange', source: 'bold, loud, high contrast', colors: ['#1a0d0a', '#c2410c', '#f97316', '#fed7aa', '#fef3c7'] }
    ],

    /* ====================================================================
       SIMILAR GAMES — starting point for market research
       ==================================================================== */
    comps: [
      { title: 'Megabonk', year: 2025, tags: '3D survivors-like, physics', price: 7.99, reviews: 18400, rating: 94, hours: '25h+', team: 'One person, ~14 months', note: 'Sold over a million copies in two weeks. Proof that one person can still break out.' },
      { title: 'Brotato', year: 2023, tags: 'Arena roguelite, top-down', price: 4.99, reviews: 78000, rating: 96, hours: '40h+', team: 'One person, ~10 months', note: 'Simple look, huge replay value. Almost all of the budget went into the loop.' },
      { title: 'Death Must Die', year: 2023, tags: 'Action roguelite, hack and slash', price: 6.99, reviews: 19500, rating: 90, hours: '30h+', team: 'Small team, ~18 months', note: 'Art and voice acting carried the brand. Players complained the long-term progress was slow.' },
      { title: 'Chained Echoes', year: 2022, tags: 'JRPG, turn-based, pixel art', price: 24.99, reviews: 6200, rating: 91, hours: '35h+', team: 'One person, ~7 years', note: 'Beautiful craft. Also a warning about how long a big game takes alone.' },
      { title: 'Vampire Survivors', year: 2022, tags: 'Bullet heaven, roguelite', price: 4.99, reviews: 200000, rating: 98, hours: '60h+', team: 'Started solo', note: 'Invented the genre. Set the price expectation for everything like it.' },
      { title: 'Balatro', year: 2024, tags: 'Deckbuilder, roguelite', price: 14.99, reviews: 40000, rating: 98, hours: '40h+', team: 'One person', note: 'Proof that a $14.99 game built on systems can outsell far bigger productions.' },
      { title: 'Dave the Diver', year: 2023, tags: 'Adventure, management, pixel art', price: 19.99, reviews: 60000, rating: 97, hours: '30h+', team: 'Small team', note: 'Shows how many different activities one game can hold without feeling messy.' },
      { title: 'Halls of Torment', year: 2024, tags: 'Survivors-like, dark fantasy', price: 4.99, reviews: 12000, rating: 93, hours: '20h+', team: 'Two people', note: 'Took an existing formula and changed the setting and pacing.' }
    ],

    /* ====================================================================
       FACTS USED IN THE GUIDES — with where they came from
       ==================================================================== */
    sources: [
      { claim: 'Steam released more than 16,000 games in 2026 by late August — roughly 70 a day.', value: '~70/day', status: 'Verified', src: 'SteamDB release stats, reported August 2026' },
      { claim: 'June 2026 Steam Next Fest was the biggest yet: over 4,300 demos, about 66% more than the year before.', value: '4,300+ demos', status: 'Verified', src: 'Festival coverage, June 2026' },
      { claim: 'Megabonk, made by one person, sold over a million copies in two weeks at around $5.49–$7.99.', value: '1M+ in 14 days', status: 'Verified', src: 'Game Developer and GamesRadar, October 2025' },
      { claim: 'Reviews turn into sales at roughly 20 to 65 times, depending on genre and price.', value: '20x to 65x', status: 'Widely used', src: 'Boxleiter method write-ups, 2025–2026' },
      { claim: 'The typical indie game on Steam earns well under $3,000 in its whole life.', value: 'under $3k', status: 'Corroborated', src: 'GameDiscoverCo and publisher reporting, 2024–2026' },
      { claim: 'Steam will not let you run a discount within about 30 days of your last one.', value: '30 days', status: 'Verified', src: 'Valve Steamworks discount rules' },
      { claim: 'Festival demos and assets must be ready well ahead of time. Valve needs about a month; plan for seven weeks.', value: '7 weeks', status: 'Verified + practice', src: 'Valve Next Fest documentation' },
      { claim: 'The developer of Only Up! delisted a hit game after burning out under sudden public attention.', value: 'delisted', status: 'Verified', src: 'Widely reported, 2023' },
      { claim: 'Stardew Valley was made by one person over about four and a half years.', value: '4.5 years', status: 'Verified', src: 'ConcernedApe interviews' },
      { claim: 'Unity 6 includes forward+ rendering, better anti-aliasing and the tools to hold 60 FPS on a Steam Deck.', value: 'shipped features', status: 'Verified', src: 'Unity 6 documentation' }
    ],

    /* ====================================================================
       DESIGN STARTER TEMPLATES PER GAME KIND
       ==================================================================== */
    gddTemplates: {
      A: {
        pillars: [
          { t: 'Every hit is felt', d: 'Anything you do creates a sound and a picture in the same frame. If swinging at nothing does not feel good, the game is not done.' },
          { t: 'Weird combinations', d: 'Replay value comes from about 80 upgrades that interact with each other, not from more artwork.' },
          { t: 'Straight into the fun', d: 'From pressing Play on the store page to being in a fight: under 8 seconds. Restarting a run is instant.' }
        ],
        loops: {
          micro: 'Dodge an attack that was clearly signalled → cut down three small enemies → hit pause and shake → pick up the shards.',
          meso: 'Clear four rooms → choose one of three upgrades → beat the area boss.',
          macro: 'Bank the permanent currency → unlock lasting upgrades and four characters → unlock harder difficulty levels.'
        },
        tech: { trisHero: 9500, trisEnemy: 1800, drawCalls: 110, vramMB: 1200, fps: 60 }
      },
      B: {
        pillars: [
          { t: 'Clever beats stronger', d: 'You win by position and combining abilities, never by grinding numbers until the fight is easy.' },
          { t: 'Earnest, not ironic', d: 'The tone stays hopeful. Anyone can be a hero, and the writing means it.' },
          { t: 'A battlefield you can read', d: 'Threat, opportunity and intent are all visible at a glance, and anything hidden is signalled first.' }
        ],
        loops: {
          micro: 'Move to flank → spend an action point → trigger a combo strike → recover.',
          meso: 'Win the fight → collect and craft → have one conversation with a companion → pick the next mission.',
          macro: 'Finish a chapter → pick a side → unlock new squad types and difficulty modifiers.'
        },
        tech: { trisHero: 12000, trisEnemy: 2500, drawCalls: 130, vramMB: 1500, fps: 60 }
      },
      C: {
        pillars: [
          { t: 'Characters you believe', d: 'Every joke shows something true underneath. They are funny because they are real.' },
          { t: 'The scale should feel quiet', d: 'The universe is huge, and that comes across through silence, not through louder art.' },
          { t: 'Each episode ends properly', d: 'No cliffhangers that punish players for having busy lives between releases.' }
        ],
        loops: {
          micro: 'Ask a companion something → make a choice that costs you → watch how they feel about you change.',
          meso: 'Finish one companion story → explore one strange place → face a boss that means something.',
          macro: 'Finish episodes → change the state of the world → carry your relationships and scars into the ending.'
        },
        tech: { trisHero: 15000, trisEnemy: 3000, drawCalls: 150, vramMB: 1800, fps: 60 }
      }
    },

    /* ====================================================================
       MARKET RESEARCH
       ==================================================================== */

    /* Conversion from public review counts to estimated sales, by kind of game */
    reviewMultipliers: [
      { id: 'strategy', label: 'Strategy and tactics', mult: 22, why: 'These players review a lot.' },
      { id: 'narrative', label: 'Story-heavy RPG', mult: 28, why: 'Emotional games get reviewed more.' },
      { id: 'roguelite', label: 'Roguelite and survivors-like', mult: 34, why: 'The standard indie benchmark.' },
      { id: 'rpg', label: 'General RPG', mult: 38, why: 'Long games, lots of reviews.' },
      { id: 'discount', label: 'Often in bundles and deep sales', mult: 44, why: 'Bundles inflate review counts.' },
      { id: 'casual', label: 'Casual and cheap', mult: 55, why: 'Casual players rarely review at all.' }
    ],

    /* What people actually search for on Steam. Review counts are approximate. */
    steamTags: [
      { tag: 'Roguelike', reviews: '2.4M', heat: 'huge' },
      { tag: 'Roguelite', reviews: '1.9M', heat: 'huge' },
      { tag: 'Action Roguelike', reviews: '980k', heat: 'high' },
      { tag: 'Bullet Heaven', reviews: '410k', heat: 'high' },
      { tag: 'Pixel Graphics', reviews: '3.1M', heat: 'huge' },
      { tag: 'Turn-Based Tactics', reviews: '520k', heat: 'medium' },
      { tag: 'Tactical RPG', reviews: '610k', heat: 'high' },
      { tag: 'Deckbuilding', reviews: '740k', heat: 'high' },
      { tag: 'Farming Sim', reviews: '890k', heat: 'high' },
      { tag: 'Management', reviews: '1.2M', heat: 'huge' },
      { tag: 'Cute', reviews: '1.4M', heat: 'huge' },
      { tag: 'Story Rich', reviews: '2.0M', heat: 'huge' },
      { tag: 'JRPG', reviews: '830k', heat: 'high' },
      { tag: 'Metroidvania', reviews: '760k', heat: 'high' },
      { tag: 'Survival', reviews: '2.2M', heat: 'huge' },
      { tag: 'Cozy', reviews: '690k', heat: 'high' },
      { tag: 'Horror', reviews: '1.5M', heat: 'huge' },
      { tag: 'Automation', reviews: '430k', heat: 'medium' },
      { tag: 'City Builder', reviews: '540k', heat: 'medium' },
      { tag: 'Space Sim', reviews: '310k', heat: 'medium' },
      { tag: 'Visual Novel', reviews: '480k', heat: 'medium' },
      { tag: 'Idler', reviews: '360k', heat: 'medium' },
      { tag: 'Rhythm', reviews: '250k', heat: 'niche' },
      { tag: 'Fishing', reviews: '180k', heat: 'niche' }
    ],

    /* Rough visibility thresholds used in the market tools. */
    marketBands: {
      invisible: 7000,
      healthy: 20000,
      strong: 60000
    },

    /* ====================================================================
       MARKETING
       ==================================================================== */

    channels: [
      { id: 'store', label: 'Steam page', effort: 'low', reach: 5, note: 'Your most important asset. Everything else points here. Update the page every few weeks.' },
      { id: 'short', label: 'Short video (Shorts, TikTok, Reels)', effort: 'medium', reach: 4, note: 'Best for games people can understand in 3 seconds. Post the same clip everywhere.' },
      { id: 'streamer', label: 'Streamers and YouTubers', effort: 'high', reach: 5, note: 'The biggest single lever for indie games. Send keys 2–3 weeks before launch.' },
      { id: 'devlog', label: 'Devlog / behind the scenes', effort: 'medium', reach: 3, note: 'Slow to build, but the audience stays. Best started before the game exists.' },
      { id: 'discord', label: 'Discord community', effort: 'medium', reach: 3, note: 'Where your most loyal players live. Keep it small and kind.' },
      { id: 'reddit', label: 'Reddit and forums', effort: 'low', reach: 3, note: 'Post genuinely useful things. Communities punish straight advertising.' },
      { id: 'festival', label: 'Steam festivals', effort: 'high', reach: 5, note: 'Amplifies what you already have. Weak before, weak after.' },
      { id: 'press', label: 'Games press', effort: 'medium', reach: 3, note: 'Write short, personal emails with a link and a gif. Follow up once.' },
      { id: 'mail', label: 'Email list', effort: 'low', reach: 3, note: 'The only audience you own. Start collecting on day one.' },
      { id: 'paid', label: 'Paid ads', effort: 'high', reach: 2, note: 'Rarely works at small scale. Test tiny, measure cost per wishlist, stop fast.' },
      { id: 'bundle', label: 'Bundles', effort: 'low', reach: 4, note: 'Great for back catalogue, bad for launch week. Wait at least six months.' },
      { id: 'itch', label: 'itch.io', effort: 'low', reach: 2, note: 'Good for demos, jams and building an audience early.' }
    ],

    /* A ready-made marketing plan. Each phase becomes a campaign you can tick off. */
    campaignTemplate: [
      {
        phase: 'Before the page goes live',
        when: 'Up to 12 months before launch',
        goal: 'Start telling people what you are making, and collect the first few hundred followers.',
        tasks: [
          'Make a one-page itch.io or landing page',
          'Post the first devlog or progress thread',
          'Join two or three communities where your players already are',
          'Start collecting email addresses',
          'Write down the one-sentence pitch and keep reusing it'
        ]
      },
      {
        phase: 'Store page and wishlists',
        when: '6–9 months before launch',
        goal: 'Get the Steam page live so every later bit of attention has somewhere to go.',
        tasks: [
          'Publish the Steam page with 5 screenshots and a short trailer',
          'Update the page every month with something new',
          'Change the capsule image if the click rate is low',
          'Post the page everywhere, once, without spamming',
          'Set a wishlist target and track it weekly'
        ]
      },
      {
        phase: 'The demo push',
        when: '2–4 months before launch',
        goal: 'Get a demo in front of as many of the right people as possible.',
        tasks: [
          'Finish a tight 15–20 minute demo',
          'Register for a Steam festival',
          'Send 20 keys to small streamers before the big ones',
          'Run a small paid test to find your cost per wishlist',
          'Collect feedback and fix the top three complaints'
        ]
      },
      {
        phase: 'Launch month',
        when: 'The 4 weeks before release',
        goal: 'Everything is ready so launch week is about replying, not building.',
        tasks: [
          'Confirm the launch discount is set (10–15%)',
          'Send the press and creator emails with an embargo date',
          'Schedule your own posts for launch day',
          'Write the launch announcement for Discord, email and the store page',
          'Prepare a press kit: logo, screenshots, gifs, contact details'
        ]
      },
      {
        phase: 'Launch week',
        when: 'Day 0 to day 7',
        goal: 'Be present, be fast, be polite.',
        tasks: [
          'Post the launch announcement at the same time everywhere',
          'Reply to every review in the first three days',
          'Watch for crashes and ship a fix within 12 hours',
          'Thank the creators who covered it',
          'Keep posting clips every day while the algorithm cares'
        ]
      },
      {
        phase: 'The long tail',
        when: 'Month 2 onwards',
        goal: 'Keep the game visible without spending your life on it.',
        tasks: [
          'Plan patches with genuinely new content',
          'Follow the discount ladder, 30 days apart at minimum',
          'Write a post-mortem while it is fresh',
          'Pitch the game to one or two bundles',
          'Feed what you learned into the next project'
        ]
      }
    ],

    /* Things you can post. Turn these into content calendar entries. */
    contentIdeas: [
      { type: 'Clip', title: 'The 5-second hook clip', note: 'The single most satisfying moment in the game, with no intro.' },
      { type: 'Clip', title: 'Funny bug compilation', note: 'People love these. Save the good bugs before you fix them.' },
      { type: 'Clip', title: 'Before and after', note: 'The same area at the start and the end of development.' },
      { type: 'Devlog', title: 'How I solved a specific problem', note: 'Concrete and technical beats vague and emotional.' },
      { type: 'Devlog', title: 'What I cut and why', note: 'Cuts are interesting. Nobody else shows them.' },
      { type: 'Image', title: 'Enemy design sheet', note: 'Show the silhouettes and what each one is for.' },
      { type: 'Image', title: 'Colour palette reveal', note: 'Cheap to make, easy to share.' },
      { type: 'Post', title: 'Ask a real question', note: 'Which of these two names is better? People love voting.' },
      { type: 'Post', title: 'Milestone announcement', note: 'Demo is live, page is up, trailer is out. One per milestone, no more.' },
      { type: 'Video', title: 'Trailer', note: 'Gameplay in the first three seconds. Always.' },
      { type: 'Video', title: 'Streamer-friendly explainer', note: 'A 30-second explainer creators can watch before playing.' },
      { type: 'Email', title: 'Monthly progress email', note: 'Short, one picture, one link. Do not skip months.' }
    ],

    /* Where to send the game. Generic categories — fill in the real names yourself. */
    pressTypes: [
      { type: 'Big outlet', who: 'Large gaming news sites', when: '3–4 weeks before launch', note: 'They need a news reason: a demo, a date, or a trailer. Send once, politely.' },
      { type: 'Genre site', who: 'Sites dedicated to your genre', when: '2–4 weeks before launch', note: 'Far more likely to cover you. Personal emails work best.' },
      { type: 'Mid-size YouTuber', who: '50k–300k subscribers, plays your genre', when: '3 weeks before launch', note: 'The best value. Give them a key early and let them pick their own angle.' },
      { type: 'Small YouTuber', who: 'Under 50k, plays your genre', when: '2 weeks before launch', note: 'They are often the most enthusiastic. Treat them well.' },
      { type: 'Streamer', who: 'Live streamers in your genre', when: '1–2 weeks before launch', note: 'Live games sell better than videos because viewers can buy immediately.' },
      { type: 'Newsletter', who: 'Genre newsletters and curators', when: '2 weeks before launch', note: 'A single mention can outperform everything else. Keep the email to four sentences.' },
      { type: 'Community', who: 'Subreddits and Discords', when: 'Launch week', note: 'Read the rules first. Post as a person, not a brand.' }
    ],

    /* A press email that actually gets read. */
    pressEmail: 'Subject: [Game name] — [genre] with [one unusual thing] — demo out now\n\n' +
      'Hi [name],\n\n' +
      'I make games on my own and just released the demo for [Game name]. It is a [genre] where [the single most interesting thing about it], and it takes about 20 minutes to see the whole loop.\n\n' +
      'Here is the trailer: [link]\nSteam page with the demo: [link]\nPress kit with gifs and screenshots: [link]\n\n' +
      'If it looks like something you would cover, I can send a key straight away. If not, no worries at all — thanks for reading.\n\n' +
      '[Your name]\n[Your site or social]',

    /* Launch-day schedule you can follow. */
    launchRunbook: [
      { time: '−14 days', what: 'Freeze the build', why: 'Nothing changes after this. Every late change risks the launch.' },
      { time: '−7 days', what: 'Send press and creator emails', why: 'Early enough to be written about, late enough to still be news.' },
      { time: '−3 days', what: 'Schedule your own posts', why: 'Launch day is too busy to write copy.' },
      { time: '−1 day', what: 'Final check of the store page', why: 'Price, discount, trailer order, tags. One last read.' },
      { time: '−2 h', what: 'Lift the embargo', why: 'Press can publish just before the store unlocks.' },
      { time: '0 h', what: 'Announce everywhere at once', why: 'Store page, Discord, email, socials. Same message, same time.' },
      { time: '+2 h', what: 'Watch for crashes', why: 'The first reports tell you if there is a problem.' },
      { time: '+6 h', what: 'Reply to the first reviews', why: 'Early reviews set the tone. Be gracious, especially to the bad ones.' },
      { time: '+24 h', what: 'Ship the first hotfix', why: 'Fix the top complaint on day one and say so publicly.' },
      { time: '+72 h', what: 'Write down what happened', why: 'Sales, wishlists, refunds, the top three complaints. While you remember.' },
      { time: '+7 days', what: 'Thank the creators', why: 'A short personal message now buys goodwill for the next game.' },
      { time: '+30 days', what: 'Plan the first discount', why: 'Remember the 30-day rule. Do not rush the first price cut.' }
    ],

    /* Everything you should have ready before launch. */
    launchAssets: [
      { item: 'Capsule image (all four sizes)', why: 'This is your advert. It gets seen more than anything else you make.' },
      { item: 'Five clean gameplay screenshots', why: 'No logos, no menus, no text. Show the game.' },
      { item: '60-second trailer', why: 'Gameplay in the first three seconds or people scroll past.' },
      { item: 'Short description (under 300 characters)', why: 'Verb, genre, twist. One breath.' },
      { item: 'Long description with gifs', why: 'This is where people decide. Break it into short paragraphs with headers.' },
      { item: 'Feature bullets (5–7)', why: 'Short lines starting with a verb. Not a wall of text.' },
      { item: 'Achievements list', why: 'Cheap to add and some players buy for these alone.' },
      { item: 'Press kit page', why: 'Logo, screenshots, gifs, contact, one-paragraph description.' },
      { item: 'Discord or community link', why: 'Where players go after buying. Also where bugs get reported.' },
      { item: 'Launch announcement text', why: 'Write it in advance so launch day is copy-paste.' },
      { item: 'Refund and support answers', why: 'Two or three common questions answered in advance saves hours.' },
      { item: 'Discount ladder plan', why: 'Decide the plan now so you do not improvise under pressure.' }
    ],

    /* ====================================================================
       REUSABLE DOCUMENT TEMPLATES
       ==================================================================== */
    templates: [
      {
        id: 'pitch',
        title: 'One-page game pitch',
        use: 'Fill this in before you commit to anything. If you cannot, the idea is not ready.',
        body: 'GAME NAME:\n\nONE SENTENCE:\nIt is [game A] meets [game B], and the clever bit is [Z].\n\nWHO IT IS FOR:\nPeople who already play [genre] and [other genre].\n\nWHAT YOU DO, OVER AND OVER:\n1.\n2.\n3.\n\nWHAT MAKES IT DIFFERENT:\n\nSIMILAR GAMES ON STEAM:\n1.  Price:  Reviews:\n2.  Price:  Reviews:\n3.  Price:  Reviews:\n\nHOW LONG IT SHOULD TAKE:\nAbout ___ weeks, plus 25% for things going wrong = ___ weeks.\n\nHOW MUCH IT SHOULD MAKE:\nAt $___ per copy and about $___ net per copy, I need ___ copies to break even.\n\nWHAT COULD KILL IT:\n\nWHAT I AM CUTTING BEFORE I START:\n'
      },
      {
        id: 'press',
        title: 'Press and creator email',
        use: 'Keep it under 150 words. One link, one reason to care, no attachments.',
        body: 'Subject: [Game] — [genre] with [unusual thing] — demo out now\n\nHi [name],\n\nI make games on my own and just released the demo for [Game]. It is a [genre] where [most interesting thing], and the loop takes about 20 minutes to see.\n\nTrailer: \nSteam page: \nPress kit: \n\nHappy to send a key if it looks useful. No worries if not.\n\n[Name]'
      },
      {
        id: 'announce',
        title: 'Launch announcement',
        use: 'Post the same text everywhere at the same time.',
        body: '[GAME] is out now!\n\n[One sentence about what it is.]\n\n[One sentence about what makes it interesting.]\n\nIt is $___ with a launch discount of ___% for the first week.\n\n[Link]\n\nThank you to everyone who wishlisted, playtested, or just said something kind. It genuinely helped.'
      },
      {
        id: 'postmortem',
        title: 'Post-mortem',
        use: 'Write this within a week of launch, before the memories fade.',
        body: 'WHAT I PLANNED:\n\nWHAT ACTUALLY HAPPENED:\n\nWHAT WENT WELL:\n\nWHAT WENT BADLY:\n\nWHAT TOOK LONGER THAN EXPECTED:\n\nWHAT TOOK LESS TIME THAN EXPECTED:\n\nNUMBERS:\nWishlists before launch:\nFirst week sales:\nFirst month sales:\nRefund rate:\nReviews and score:\n\nWHAT I WILL DO DIFFERENTLY NEXT TIME:\n\nTHE ONE THING I WOULD TELL SOMEONE STARTING TODAY:\n'
      },
      {
        id: 'storecopy',
        title: 'Store page text framework',
        use: 'Write the short description last — it is the hardest.',
        body: 'SHORT DESCRIPTION (under 300 characters)\n[What you do] + [what kind of game] + [the twist].\n\n\nFEATURE BULLETS (5–7)\n• [Verb] [thing] — [why it matters]\n• ...\n\n\nLONG DESCRIPTION\n\nParagraph 1 — what the game is, in two sentences.\n\n[GIF of the core loop]\n\nParagraph 2 — the core loop, described as actions.\n\n[GIF of the twist]\n\nParagraph 3 — what makes it different from the other games Like It.\n\n[GIF of a big moment]\n\nHeader: Key features\n• ...\n\nHeader: About me\nOne or two sentences. People buy from people.'
      },
      {
        id: 'weekreview',
        title: 'Weekly review',
        use: 'Five minutes every Friday. This is what keeps a long project honest.',
        body: 'WEEK OF:\n\nHOURS WORKED:\n\nWHAT I SAID I WOULD FINISH:\n\nWHAT I ACTUALLY FINISHED:\n\nWHAT GOT IN THE WAY:\n\nWHAT I AM DOING MONDAY:\n\nONE THING I AM WORRIED ABOUT:\n'
      }
    ],

    /* ====================================================================
       GLOSSARY — plain English for the words this app uses
       ==================================================================== */
    glossary: [
      { term: 'Alpha', means: 'All the features exist but none of them are finished. The point of it is to start cutting.' },
      { term: 'Build', means: 'A version of the game you can actually play. Making one every week keeps you honest.' },
      { term: 'Capsule', means: 'The picture of your game on the Steam store. It is the advert, so it matters more than the logo.' },
      { term: 'Conversion', means: 'The share of people who look at your page and then wishlist or buy it.' },
      { term: 'Core loop', means: 'What the player does over and over. Usually described at three sizes: seconds, ten minutes, and the whole game.' },
      { term: 'Demo', means: 'A free slice of the game, usually 15–20 minutes, used to win wishlists before launch.' },
      { term: 'Greybox', means: 'Placeholder shapes with no art, used to test whether something is fun before you spend money making it pretty.' },
      { term: 'Vertical slice', means: 'One small piece of the game finished to final quality, so you know the real cost of everything else.' },
      { term: 'Wishlist', means: 'Someone saved your game on Steam. It is the only reliable sign of interest before launch.' },
      { term: 'Wishlist velocity', means: 'How many wishlists you gain per day. Going up before launch matters more than the total.' },
      { term: 'Next Fest', means: 'Steam\'s big demo festival. You can only take part in one per game, so pick the timing carefully.' },
      { term: 'Keywords', means: 'The words people type into the search box. If nobody searches for your words, nobody finds you.' },
      { term: 'Tags', means: 'The labels you pick on Steam. They decide which recommendation lists you can appear in.' },
      { term: 'Boxleiter', means: 'A rough method for guessing a game\'s sales from how many reviews it has. Multiply reviews by roughly 20 to 65.' },
      { term: 'Net revenue', means: 'What actually reaches you after the platform cut, taxes, regional pricing and refunds. Usually around half of the price.' },
      { term: 'MSRP', means: 'The price on the store page. What you charge.' },
      { term: 'Break-even', means: 'The number of copies you need to sell before you have made back what you spent.' },
      { term: 'Refund rate', means: 'The share of buyers who ask for their money back. Usually 5–15%, and higher for short games.' },
      { term: 'Regional pricing', means: 'Steam charges less in poorer countries. It brings in buyers but lowers your average income per copy.' },
      { term: 'Discount ladder', means: 'A pre-planned schedule of sales: month 3, 6, 12, 18. Planned in advance so you do not panic-discount.' },
      { term: 'Bundle', means: 'Selling several games together at a lower price. Good for old games, bad for a new launch.' },
      { term: 'Embargo', means: 'An agreed time when press are allowed to publish. Lets everyone write at the same moment.' },
      { term: 'Creative', means: 'The actual video or image in an advert.' },
      { term: 'CPC / CPM', means: 'Cost per click and cost per thousand views. Advertising prices.' },
      { term: 'ROI', means: 'Return on investment. How much money you got back for each dollar you spent.' },
      { term: 'Milestone', means: 'A date by which a chunk of work is finished. It is a promise, not a mood.' },
      { term: 'Buffer', means: 'Extra time added to every estimate, usually 25%. It is for things going wrong, not for extra features.' },
      { term: 'Scope creep', means: 'The game slowly getting bigger while you work on it. It is the most common reason solo games never ship.' },
      { term: 'Burnout', means: 'What happens when you work past your limits for too long. It costs more time than it saves.' },
      { term: 'Journey log', means: 'Telling the story of making the game, not just promoting it. Builds an audience before you have anything to sell.' },
      { term: 'Single active production', means: 'Exactly one game is in full production at a time. Everything else waits in the background.' }
    ].map(function (g) { return { term: g.term, means: g.means }; }),

    /* ====================================================================
       IDEAS PARKING LOT prompt tags
       ==================================================================== */
    ideaTags: ['Mechanic', 'Setting', 'Name', 'Art', 'Audio', 'Story', 'Marketing', 'Business', 'Other'],

    weekCeiling: 40
  };
})();
