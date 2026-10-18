# UMBER

Concept website for a specialty coffee room in Riga.
One dial travels from citrus to cocoa. Each turn re-lights the room, shifts the sound and changes the origin, then pours the cup that matches your taste.

## Preview locally

Opened straight from the folder (index.html) everything works, sound included. Some browsers still prefer a tiny local server. In Terminal:

    cd ~/Sites/umber
    python3 -m http.server 8000

Then open http://localhost:8000

## What's in the folder

- `index.html`, `styles.css`, `app.js`, `story.js`: the whole site, in plain HTML, CSS and JavaScript (no install, no build)
- `products.js`, `shop.js`, `shop.css`: the menu, signature drinks, takeaway cups, coffee beans and the basket
- `assets/img/`: web-sized photos (from the Magnific originals)
- `assets/audio/`: two ambient loops (see CREDITS.md)
- `_source/`: full-size originals. Don't upload this folder to GitHub or Vercel.
- `_v1-bright-to-deep/`: yesterday's first version, kept for reference

## Status

- First screen: the café photograph is the full-screen hero (unchanged). The tasting wheel re-lights the room and opens the coffee card.
- Coffee card (desktop ≥ 1100 px): appears on hover, tap or selection, beside the wheel over the oak bar front. Large cup with a steam loop, coffee name, tasting notes, beans and brew, price, Add this cup. Phones and tablets show the same cup and steam beside the coffee name.
- Coffee media: the five wheel coffees are one series: the same UMBER cream stoneware cup and saucer with the UMBER wordmark, in the same place on the café's walnut counter, natural window light, only a thin wisp of steam; only the drink and what lies on the saucer change: black pour-over with orange peel (citrus), black Kenyan filter with raspberries and redcurrants (red berry), honey latte with a honey dipper (honey), cortado with hazelnuts and salted caramel (caramel), double espresso with dark chocolate and cocoa nibs (cocoa). The master shot was made in Krea (Nano Banana 2.1) from the earlier honey latte photo and the menu's UMBER cup; the citrus edit in Krea, the other three with the same model in Higgsfield.
  - posters / static fallback: `assets/img/coffee-<note>-720.jpg`
  - steam loops (5 s, seamless): `assets/video/coffee-<note>.mp4` (H.264) and `.webm` (VP9), Kling 3.0 with the photograph as both first and last frame, so only the steam moves; all five checked to have clearly visible steam (`_source/coffee-v4/motion.py` measures it). Sources in `_source/coffee-v4/` (`kling2/` are the takes in use, the earlier quieter loops are in `web-v4a/`); the previous series (mixed ceramic cups) in `_source/coffee-v3/` (its site files in `_source/coffee-v3/web-backup/`), the glass-cup series in `_source/coffee-v2/`, the ivory-cup series in `_source/coffee-v1/`.
  - `<note>` = citrus, red-berry, honey, caramel, cocoa. To swap media, replace the files with the same names, or edit `MEDIA` at the top of `app.js`.
  - originals: `_source/coffee/`
- Café photos: `assets/img/room-morning|afternoon|evening-1280/2400.jpg` (originals in `_source/v3/`).
- Not used any more (safe to delete): `assets/img/cup-01…05-2048.jpg`, `assets/img/cup-01…05-700.jpg`, `assets/img/cup-01…05-1200.jpg`.
- Doorway: the street front, then the camera pushes through the glass door into the café (scroll).
- The journey (`story.js`): a pinned, scroll-driven story below the café, six chapters (Origin, Selection, Roasting at UMBER, Grinding, Extraction, Your senses). One bean travels through all of them: it is born in an opened cherry, roasts from green through pale yellow and gold to brown under amber light, comes forward alone, cracks into grounds; the camera tilts down from the grinder to the machine; the extraction video is scrubbed by scroll; the final cup is the coffee chosen on the wheel. Videos load one at a time as you get near them. Copy follows the selected coffee's origin, process, brew and price.
  - images: `assets/img/story-origin|green|roast|grind|extract-1280/2400.jpg`, `story-origin-open-1280/2400.jpg` (same frame, the nearest cherry opened), `story-extract-end-1280.jpg`, beans `assets/img/bean-green|yellow|golden|roasted.webp` (aligned, crossfaded by scroll; yellow is a colour blend of green and golden)
  - videos: `assets/video/story-roast` (loop) and `story-extract` (scrubbed), `.mp4` + `.webm`
  - originals: `_source/story/`
  - CHECK: "Roasting at UMBER" assumes UMBER roasts its own coffee. Confirm or change.
- Menu and shop (below the journey): "Find your perfect coffee" (30 drinks, four across on a computer, three on a tablet, two on a phone, every row full, filters All / Single origins / Hot drinks / Iced / Signature / Takeaway; "Single origins" are the five coffees of the tasting wheel, with the same names, prices and photos, and "Order this coffee" on the wheel adds the same menu item; a product view with size and here-or-to-go), "Signature creations" (four drinks), "Take UMBER with you" (the paper cup family: forest, cream, season; no plastic: iced drinks are served in clear glass coffee mugs), and "Bring UMBER home" (House Blend, Colombia, Ethiopia, Sumatra, Kenya, Brazil, Guatemala, Decaf; grind options). New house creations on the menu: banana cream latte, cinnamon affogato latte, pistachio white hot chocolate, crème brûlée latte, coconut bon-bon latte, pumpkin spice matcha, tiramisu latte, black sesame honey latte (photos `assets/img/menu/<drink>.jpg`, Krea). The café hero has a small takeaway strip with Order takeaway (opens the menu on Takeaway) and Explore our coffee (the beans).
  - All products, recipes, prices, sizes and photos are in `products.js`, one place to edit. CHECK: everything in it is proposed content (drinks, recipes, prices, sizes, roast levels, bag weights, tasting notes) for the café to confirm.
  - The basket (`app.js`) holds every product with its options and quantity, and is kept in the browser (localStorage), so it survives a reload and goes on to the checkout. The Basket button opens the list with totals and a Checkout button. See "Ordering and payment" below.
  - Photos: `assets/img/menu/<drink>.jpg`, `assets/img/beans/<bag>.jpg`, `assets/img/shop/cups-family.jpg`, `takeaway-still.jpg` (Krea, Nano Banana 2.1; originals in `_source/shop/`). Until a photo exists, a card shows a drawn outline of its cup.
  - Backup of the homepage before the shop: `lab/backup-pre-shop/`.
- The homepage story is now the film (see "The film" below): it plays on `index.html` right after the café. The original scroll journey of the bean is kept, unchanged, at `story-classic.html` (its section is `lab/story-classic.section.html`, code `story.js`).
- Story lab (development only, not linked from the site): open `story-lab.html` to switch between the homepage (the film), the original journey and versions A, B, C.
  - Version A, Living cinematic scenes: `story-a.html`, code in `lab/story-a.js` and `lab/story-a.css`.
  - Version B, Continuous journey: `story-b.html`, code in `lab/story-b.js` and `lab/story-b.css`.
  - Version C, Follow the bean: `story-c.html`, code in `lab/story-c.js` and `lab/story-c.css`. One continuous world with a scroll-driven camera; the continuity plan (what moves where, beat by beat) is written at the top of `lab/story-c.js`. Shots that would replace its stand-ins, with prompts: `lab/SHOTS.md`.
  - `story-classic.html`, `story-a.html`, `story-b.html`, `story-c.html` and `story-film.html` are built from `index.html` (same café, wheel, card and basket); only the story section differs (`lab/story-x.section.html`). After changing `index.html`, rebuild them: `python3 lab/build-pages.py`.
  - Footage used only by the lab: `assets/video/story-origin-loop`, `story-select-loop`, `story-grind-loop` (`.mp4` + `.webm`, seamless loops; posters `assets/img/story-*-loop-poster.jpg`). Made in Higgsfield (Kling 3.0 Turbo, 720p) from the story stills; originals in `_source/story/raw-origin|select|grind.mp4`.
  - The film (on the homepage; also `story-film.html`). The header button "Our story: from farm to cup" (and the same in the footer) plays it again. One scroll on from the café starts a short film (about 25 seconds, `assets/film/umber-story.mp4/.webm`) that plays by itself; "Skip story →" (or Esc) goes straight on; scrolling up pauses it; at the end the page carries on to "Your cup", which uses the café's own coffee data, wheel and basket (`lab/story-film.js`, `.css`, `.section.html`). The film is cut from 16 generated shots (Higgsfield: Nano Banana 2.1 key frames, Kling 3.0 shots, each from one key frame to the next; the ending is Kling 3.0 pro from Krea: the barista brings her coffee to the window table (`_source/film/shot-E2.mp4`, key frame `KS1`), then straight to her sip and smile, close up (`shot-F2.mp4`, and `shot-F2-close.mp4`, the same take cropped closer); the shot of the hand at the bar (S14) is no longer used); the cut (which part of each shot, at what speed) is `cut` in `lab/film/film.js`, rebuilt with `python3 lab/film/cut.py`. The full record, shot by shot, with every key frame and prompt: `lab/film/storyboard.html`. Source shots and key frames: `_source/film/`. The 32-second cut with the earlier ending (she walks in, sits, sips) is kept in `lab/film/backup-32s/`, and the 25-second cut in `lab/film/backup-25s/`. Earlier versions still play: `story-film-scrub.html` (the film played by scrolling, 90 s, rebuilt with `lab/film/assemble.py`) and `story-film-90s.html` (the first 90-second version). (`assets/film/umber-animatic.*` is no longer used; safe to delete.)
  - To remove a version later: delete its `story-x.html` and `lab/story-x.*` files. To remove the lab: delete `story-lab.html`, the `story-*.html` pages, `assets/film/` and the `lab/` folder.
- Ordering and payment
  - `checkout.html` (+ `checkout.js`, `checkout.css`): the order (change quantities), pick up at UMBER or delivery in Riga (coffee beans only; drinks are pickup only), a pickup time from the opening hours, name, e-mail, phone and a note, the ordering terms, then Pay. After paying, the same page shows the confirmation with the order number.
  - `order-config.js`: opening hours, preparation time, pickup time steps, delivery price (€3.50, free from €30) and the Riga postcodes. CHECK: all of it is proposed. The checkout page and the server both read this file, so change it in one place.
  - Payment is a concept (UMBER is a concept site, so no real payment system is connected): the page offers Apple Pay, Google Pay or a demo card (•••• 4242, nothing to type), "Pay" shows a short paying moment, then the confirmation with an order number. No card details are asked for, nothing is charged and the order is not sent anywhere.
  - A Stripe-ready server version (prices checked on the server, Stripe Checkout) is kept, unused, in `_source/stripe-ready/` in case the site ever becomes real.
  - Adding anything to the basket shows a small note at the bottom ("… added · View basket").
- Pour your own cup (`pour.js`, between Signature creations and To take away): a real photograph of an empty UMBER glass mug with a live liquid simulation inside (WebGL2). Fourteen ingredients in three rows: Coffee & milk (Espresso, Milk, Matcha, Ice), Sauces & flavours (Chocolate, Caramel, Pistachio, Crème brûlée, Banana, Coconut, Honey) and On top (Milk foam, Cinnamon, Cocoa). Press and hold to pour; ice, cinnamon and cocoa are a tap. Studied from slow-motion films of real pours: every liquid has a weight, so the drink settles into soft layers (sauce at the bottom, milk, espresso, foam on top), a pour plunges in and hangs in marbled ribbons and curtains, coffee is clear and amber where it is thin, milk is opaque and creamy, ice is clear and floats with its top out. The page then names the closest drink on the menu (including the new signature drinks) and offers to add it to the basket. Empty the glass drains it.
  - The photograph and its map (inside of the glass, depth, highlights) are in `assets/img/pour/pour-assets.js` as data URLs, so it also works when the site is opened as files; `assets/img/pour/plate.jpg` is the photograph alone, shown before the effect starts. Both are rebuilt from `_source/pour/plate-empty.png` and `plate-filled.png` with `python3 lab/pour/make-assets.py` (the inside of the glass is drawn from its measured outline, down to the thick base).
  - Without WebGL2 the glass fills in calm flat layers instead.
- Next: Your Ritual, Visit Us, Doorway at night.

Anything marked CHECK on the page (prices, origins) is sample content to confirm.

## Publishing
`.vercelignore` lists everything that must not be uploaded: `_source`, the lab pages and backups, unused films and pictures. With it the upload is 89 files, about 27 MB (instead of about 1 GB); the live page and checkout were checked from exactly that set, with no missing files. The CHECK marks (address, opening hours, contacts, prices, ordering terms, VAT) stay in the pages but are hidden from visitors (`data-checks="hide"` on `<html>`); open `index.html?checks` or `checkout.html?checks` to see them all. After publishing, put the site's full address into `og:image` in index.html so link previews show the picture.
