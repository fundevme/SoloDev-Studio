/* ==========================================================================
   LEARN — Guide 3: Getting people to actually play your game
   ========================================================================== */
(function () {
  'use strict';
  var App = window.App;
  App.guides = App.guides || {};

  App.guides.marketing = {
    id: 'marketing',
    label: 'Getting people to play it',
    title: 'Getting people to actually play your game',
    tag: 'Marketing · Advertising · Launch · Steam',
    deck: 'Marketing is not a week of panicking before launch. It is a long, boring, consistent habit that starts the day you decide what you are making. Here is the whole thing, in order, with numbers.',
    sections: [
      {
        id: 'mk-truth',
        title: 'The three things that are actually true',
        blocks: [
          { t: 'list', items: [
            '**Nobody is waiting for your game.** You are not competing with other indie games. You are competing with everything else a person could do with that hour.',
            '**Marketing is not a launch activity.** The week of launch is when you *collect*. The 12 months before it are when you *earn*.',
            '**One good channel beats five bad ones.** Most solo developers should pick one place their players already are, and be consistent there for a year.'
          ] }
        ]
      },
      {
        id: 'mk-what-counts',
        title: 'What actually sells games',
        blocks: [
          { t: 'p', x: 'Ranked by how much they usually matter for a small game, from most to least:' },
          { t: 'table', head: ['#', 'What', 'How much it moves the needle', 'Where it happens'], rows: [
            ['1', 'Steam\'s own recommendation system', 'Enormous', 'Driven by your tags, your page quality and your early sales'],
            ['2', 'Streamers and YouTubers', 'Enormous', 'A single mid-size video can double a small game\'s sales'],
            ['3', 'Steam festivals', 'Large', 'Amplifies what you already have. Weak in, weak out.'],
            ['4', 'Short video (TikTok, Shorts, Reels)', 'Large for the right game', 'Clips under 10 seconds, no talking, satisfying loop'],
            ['5', 'Your own community', 'Medium', 'Discord, email list. Small but reliable.'],
            ['6', 'Press coverage', 'Medium', 'Helps with credibility more than volume'],
            ['7', 'Paid ads', 'Small, and often negative', 'Rarely works below a few thousand dollars of spend'],
            ['8', 'Bundles', 'Small at launch, big later', 'Good for a back catalogue, terrible for launch week']
          ] },
          { t: 'callout', kind: 'info', title: 'Read that table again', x: 'The two biggest levers — the platform algorithm and videos — are both driven by the same thing: **how quickly someone understands the game and wants it**. Your trailer, your capsule image and your tags do most of the work. Everything else is distribution.' }
        ]
      },
      {
        id: 'mk-plan',
        title: 'A marketing plan in six phases',
        blocks: [
          { t: 'p', x: 'You do not need to do everything at once. Each phase has one job. Do them in order.' },
          { t: 'table', head: ['When', 'The one job', 'Do these', 'Ignore everything else'], rows: [
            ['Up to 12 months out', 'Start telling people', 'Post progress, make a landing page, start an email list, join two communities', 'Ads, press, festivals'],
            ['6–9 months out', 'Get the Steam page live', 'Publish the page, five screenshots, a short trailer, update it monthly', 'Discount strategy, bundles'],
            ['2–4 months out', 'Build the audience', 'Finish a tight demo, register for a festival, send 20 keys to small creators, test a small ad', 'Big press, bundles'],
            ['1 month out', 'Get everything ready', 'Confirm the discount, send press emails with an embargo, schedule your own posts, build a press kit', 'New content'],
            ['Launch week', 'Be present', 'Announce everywhere at once, reply to reviews, fix crashes fast, thank creators', 'Anything that is not about this week'],
            ['Month 2 onward', 'Keep it alive', 'Plan patches, run the discount ladder, write the post-mortem, pitch one bundle', 'Panic changes to the game']
          ] },
          { t: 'callout', kind: 'gold', title: 'The rule that saves launch week', x: '**Do not build anything in the four weeks before launch.** Marketing, emails and store copy only. If you are still adding features, you are one crash away from a bad review average, and the review average is what decides your next two years of sales.' }
        ]
      },
      {
        id: 'mk-wishlists',
        title: 'Wishlists: the only number that matters early',
        blocks: [
          { t: 'p', x: 'A wishlist is someone saying "I want this" without paying yet. It is the only reliable signal Steam gives you before launch, and the algorithm uses it to decide how much to show your game.' },
          { t: 'table', head: ['Wishlists at launch', 'What it usually means', 'What to do'], rows: [
            ['Under 3,000', 'You will probably be invisible', 'Delay launch. Keep building the audience.'],
            ['3,000 – 7,000', 'A small but real launch', 'Launch, but expect most sales to come from festivals and later discounts.'],
            ['7,000 – 20,000', 'A solid small-game launch', 'Launch on schedule. Expect a good first week and a long tail.'],
            ['20,000 – 60,000', 'Strong', 'You will appear in recommendation feeds. Push hard at launch.'],
            ['60,000+', 'You have a hit on your hands', 'Everything you do will be amplified. Do not waste the moment.']
          ] },
          { t: 'p', x: 'The important thing is not the total, it is **the speed**. A game gaining 40 wishlists a day for six months is in a much better place than one that gained 7,000 in one viral day and then 2 a day. Steady beats spiky.' },
          { t: 'callout', kind: 'warn', title: 'Wishlists are not sales', x: 'On a normal launch, expect roughly **8–15% of your wishlists to buy in the first week**. A campaign that gets 10,000 wishlists and converts at 5% is worse than one that gets 6,000 and converts at 14%. Watch your store page conversion rate, not just the counter.' }
        ]
      },
      {
        id: 'mk-trailer',
        title: 'The trailer and the first three seconds',
        blocks: [
          { t: 'p', x: 'Most people decide whether to keep watching in about three seconds. Almost every indie trailer wastes them on a logo.' },
          { t: 'list', items: [
            '**Second 0–3:** the single most interesting thing that happens in your game. No logo, no title, no fade in.',
            '**Second 3–15:** what the player actually does. Show the core loop twice so it reads.',
            '**Second 15–40:** the variety — the different enemies, areas, upgrades, characters.',
            '**Second 40–55:** the emotional peak. The boss, the twist, the biggest explosion.',
            '**Second 55–60:** title, a one-line description, and the release date or demo call to action.'
          ] },
          { t: 'callout', kind: 'info', title: 'Make a silent version too', x: 'Many people watch with the sound off, and short-video platforms autoplay muted. If your trailer is confusing with no sound, it is confusing for a large share of your audience. **If it does not read silently, it does not work.**' }
        ]
      },
      {
        id: 'mk-capsule',
        title: 'The capsule image is your actual advert',
        blocks: [
          { t: 'p', x: 'Your capsule — the little box art on the store — gets seen more than anything else you will ever make. It appears in search results, in recommendation rows, in festival lists, and next to every other game.' },
          { t: 'list', items: [
            '**Read it at 1 centimetre tall.** Shrink it to a thumbnail on your screen. If you cannot tell what it is, start again.',
            '**One subject, big.** A character or a single object. Not a scene.',
            '**Contrast against everything else.** Most Steam capsules are dark blue or dark grey. Be a different colour.',
            '**The title must be readable.** Two or three words, thick letters, high contrast.',
            '**Change it if the click rate is poor.** You can swap the capsule whenever you like. Test a new one for two weeks and compare.',
            '**No text that needs reading.** Nobody reads the tagline on a 100-pixel image.'
          ] },
          { t: 'callout', kind: 'gold', title: 'A cheap trick that works', x: 'Search your game\'s main tag on Steam and screenshot the results page. Put your capsule in among them. If it does not stand out in that specific grid, that is what your store page looks like to every player who finds you.' }
        ]
      },
      {
        id: 'mk-outreach',
        title: 'Getting creators to play it',
        blocks: [
          { t: 'p', x: 'This is the highest-return work you can do, and most developers do it badly because they treat it like a press release instead of a message to a person.' },
          { t: 'table', head: ['Who', 'When to contact', 'What to send', 'What to expect'], rows: [
            ['Small YouTubers and streamers (under 50k)', '3 weeks before launch', 'A key and one short personal message saying why you thought of them specifically', 'The highest response rate by far. Often the most enthusiastic.'],
            ['Mid-size creators (50k–300k)', '3 weeks before launch', 'A key, the press kit link, and one sentence on what makes it different', 'Worth most of your effort. Give them freedom to play it their way.'],
            ['Large creators', '4–6 weeks before launch', 'A short, specific email. One link, no attachments.', 'You will usually be ignored. Send anyway — it is cheap.'],
            ['Press and news sites', '3–4 weeks before launch', 'A news reason: a demo, a date, a trailer. Not "please cover my game".', 'Coverage helps credibility. Do not expect volume.'],
            ['Newsletters and curators', '2 weeks before launch', 'Four sentences and a link', 'A single mention here can outperform everything else you do.']
          ] },
          { t: 'h', x: 'The email that works' },
          { t: 'p', x: 'Short. Personal. One reason to care. One link. No attachments. No "I hope this email finds you well". No press release formatting.' },
          { t: 'code', title: 'Press and creator email template', code: 'Subject: [Game] — [genre] with [one unusual thing] — demo out now\n\nHi [name],\n\nI make games on my own and just released the demo for [Game].\nIt is a [genre] where [the single most interesting thing], and the\nwhole loop takes about 20 minutes to see.\n\nTrailer: [link]\nSteam page with the demo: [link]\nPress kit with gifs and screenshots: [link]\n\nHappy to send a key if it looks like something you would cover.\nNo worries at all if not.\n\n[Your name]' },
          { t: 'callout', kind: 'info', title: 'Send 20 keys, not 500', x: 'Twenty personalised messages get more coverage than five hundred copy-pasted ones, and they take about an hour. Do it in batches of ten. Track who you contacted, when, and whether they replied — there is a tracker for exactly this in the Marketing section.' }
        ]
      },
      {
        id: 'mk-paid',
        title: 'Should you pay for advertising?',
        blocks: [
          { t: 'p', x: 'Usually no — but sometimes yes, and it is worth testing properly instead of guessing.' },
          { t: 'h', x: 'When ads can work' },
          { t: 'list', items: [
            'Your store page already converts visitors into wishlists at a decent rate.',
            'You are spending to amplify a specific moment: a demo, a festival, or launch week.',
            'Your creative is real gameplay, not a logo animation.',
            'You can measure cost per wishlist and stop when it gets too expensive.'
          ] },
          { t: 'h', x: 'The maths you need before spending anything' },
          { t: 'code', title: 'Cost per wishlist and whether it is worth it', code: 'Cost per wishlist = Total spend ÷ Wishlists gained\n\nCost per sale    = Cost per wishlist ÷ wishlist-to-sale rate\n\nExample:\n  $200 spent, 120 wishlists gained\n  Cost per wishlist = $200 ÷ 120 = $1.67\n\n  If 12% of wishlists buy in the first month:\n  Cost per sale = $1.67 ÷ 0.12 ≈ $13.92\n\n  Your net per copy at $6.99 is about $3.60.\n  $13.92 to earn $3.60 is a loss. Do not scale it.\n\n  Your break-even cost per wishlist is:\n  Net per copy × conversion rate = $3.60 × 0.12 ≈ $0.43' },
          { t: 'callout', kind: 'warn', title: 'The honest version', x: 'For a $6.99 game, you can usually pay about **40 to 60 cents per wishlist** before you are losing money. Most paid campaigns come in well above that. Ads are a tool for games with a higher price, a proven conversion rate, and an existing audience — not a way to find your first players.' }
        ]
      },
      {
        id: 'mk-discounts',
        title: 'The discount ladder',
        blocks: [
          { t: 'p', x: 'Plan your discounts before launch, not after. Improvised discounts train players to wait, and Steam enforces a **30-day gap** between any two discounts including your launch one.' },
          { t: 'table', head: ['When', 'Discount', 'Why this number'], rows: [
            ['Launch', '10–15% off for about a week', 'Rewards early supporters without devaluing the game'],
            ['Month 3', '20%', 'First real bump after the launch tail dies'],
            ['Month 6', '25%', 'Aligns with a seasonal sale'],
            ['Month 12', '33%', 'One-year anniversary and a good season'],
            ['Month 18', '50% plus a bundle', 'Reaches the "I will try it at that price" crowd'],
            ['Year 2+', '50–75% in sales only', 'Keep the base price the same. Discount in events, not permanently.']
          ] },
          { t: 'callout', kind: 'info', title: 'Never permanently lower the price', x: 'A permanent price cut tells everyone who already bought that they overpaid, and it makes your next game look cheap too. Discount in scheduled sales and keep your base price where it is.' }
        ]
      },
      {
        id: 'mk-numbers',
        title: 'The numbers to watch, and what they mean',
        blocks: [
          { t: 'table', head: ['Number', 'Where to find it', 'Healthy range', 'What it tells you'], rows: [
            ['Wishlists per day', 'Steamworks wishlist report', 'Rising before launch', 'Whether your marketing is working at all'],
            ['Page visits to wishlists', 'Steamworks traffic report', '10–20%', 'Whether your capsule image and page are good'],
            ['Wishlists to first-week sales', 'Your own maths', '8–15%', 'Whether your launch reached the right people'],
            ['Refund rate', 'Steamworks', 'under 10%', 'Whether the game matches its page'],
            ['Playtime before refund', 'Steamworks', 'over 2 hours', 'Whether people are getting hooked or bouncing'],
            ['Review score', 'Your store page', 'over 85%', 'The single biggest factor in long-term sales'],
            ['Cost per wishlist', 'Your ad dashboard', 'under $0.50', 'Whether to keep paying']
          ] },
          { t: 'verdict', tag: 'The one thing to remember', x: 'Wishlists per day is the number that tells you whether the whole machine is working. Track it weekly. If it is flat for a month, something upstream is broken — usually the capsule image or the trailer.' }
        ]
      },
      {
        id: 'mk-mistakes',
        title: 'The mistakes that cost the most',
        blocks: [
          { t: 'list', items: [
            '**Launching with no wishlists.** Launch day is a multiplier, not a generator. Cold launching wastes your one good week.',
            '**Building instead of marketing in the final month.** Every late change is a chance of a crash on launch day.',
            '**Ignoring the negative reviews.** They tell you exactly what to fix. The positive ones do not.',
            '**Spending on ads before the page converts.** You are paying to send people to a page that does not sell.',
            '**Copy-pasting the same email to 500 creators.** Personal beats volume every single time.',
            '**Discounting in a panic.** It trains players to wait, and it breaks the 30-day rule for the sale you actually need.',
            '**Treating launch week as the finish line.** The first patch and the first month of reviews matter more than launch day itself.',
            '**Doing nothing between releases.** Your audience forgets. Post something every month, even if it is small.'
          ] }
        ]
      }
    ]
  };
})();
