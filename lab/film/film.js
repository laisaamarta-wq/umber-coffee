/* ==========================================================================
   UMBER · The film · production record and plan (single source of truth)
   Read by the storyboard (lab/film/storyboard.html), the scroll player
   (story-film.html) and the assembler (lab/film/assemble.py).
   Everything between the FILM-JSON markers must stay valid JSON.

   How the film is made:
   1. KEY FRAMES K0…K12: one still per cut point, each generated with the one
      before it (and the bean sheet) as reference, checked as a storyboard.
   2. SHOTS S1…S14: image-to-video from START key frame to END key frame, so a
      shot ends on exactly the frame the next one begins with.
   3. Two cuts on action (the scoop: table → roaster, tray → grinder) carry the
      bean between places, as a film would, instead of morphing one into another.
   4. assemble.py joins the shots and encodes them for scrubbing by scroll.
   ========================================================================== */
window.UMBER_FILM = /*FILM-JSON*/{
 "name": "umber-film",
 "play": {
  "kind": "film",
  "src": "assets/film/umber-film"
 },
 "made": "Key frames: Nano Banana 2.1 (Higgsfield), 2K, each chained from the frame before with the bean sheet as reference. Shots: Kling 3.0 Pro (Higgsfield), 1080p, start frame → end frame. Opening from the homepage café and ending with a guest added later the same day. Assembled with lab/film/assemble.py.",
 "look": "Photorealistic specialty-coffee film, one continuous journey. 24 fps, 16:9. Macro and close-up cinematography: 100mm macro lens at f/2.8 for the bean, 85mm at f/2.8–f/4 for machines; shallow depth of field; slow, motivated camera moves (push-in, tilt, tracking). Light: one warm key from frame left at a low angle (golden-hour sun at origin, the drum's amber glow in the roastery, warm light in the café), deep soft shadows. Grade: low-key and warm — espresso brown, charcoal, deep leaf green early, amber highlights, muted cream; fine natural film grain. No people's faces, no text, no logos.",
 "bean": "THE BEAN (identical in every shot): one coffee seed, an asymmetric oval with a fuller left shoulder and a fine S-shaped centre crease. Raw: matte green-grey. Roasted: even medium chestnut brown with a satin sheen. Reference: assets/img/bean-green.webp and bean-roasted.webp (the same bean, same pose).",
 "chapters": [
  {
   "n": "01",
   "name": "Origin",
   "title": "Every cup begins somewhere.",
   "copy": "origin",
   "from": 0,
   "to": 20.04,
   "textAt": 8.0
  },
  {
   "n": "02",
   "name": "Selection",
   "title": "Carefully selected, long before the first roast.",
   "copy": "process",
   "from": 20.04,
   "to": 35.04
  },
  {
   "n": "03",
   "name": "Roasting",
   "check": true,
   "title": "Here, the character of the coffee takes shape.",
   "copy": "roast",
   "from": 35.04,
   "to": 55.0
  },
  {
   "n": "04",
   "name": "Grinding",
   "title": "Freshly ground. Ready to unfold.",
   "copy": "grind",
   "from": 55.0,
   "to": 65.04
  },
  {
   "n": "05",
   "name": "Extraction",
   "title": "Water, pressure, precision.",
   "copy": "extract",
   "from": 65.04,
   "to": 74.96
  },
  {
   "n": "06",
   "name": "Your senses",
   "title": "From origin to your senses.",
   "copy": "final",
   "from": 74.96,
   "to": 90.54,
   "final": true
  }
 ],
 "keys": {
  "Kc": {
   "asset": "lab/film/frames/Kc.jpg",
   "note": "The café, as on the homepage (the hero photograph, afternoon).",
   "refs": ""
  },
  "K0": {
   "asset": "lab/film/frames/K0.jpg",
   "note": "The cherry cluster on the branch, golden hour (existing story still).",
   "refs": ""
  },
  "K1": {
   "asset": "lab/film/frames/K1.jpg",
   "note": "One cherry, extreme macro, low sun glowing through its skin.",
   "refs": "K0"
  },
  "K2": {
   "asset": "lab/film/frames/K2.jpg",
   "note": "The same cherry split along its seam; the left seed is THE BEAN.",
   "refs": "K1, the opened-cherry still, bean sheet"
  },
  "K3": {
   "asset": "lab/film/frames/K3.jpg",
   "note": "THE BEAN alone in mid-air, dried green-grey, the light lower and warmer.",
   "refs": "K2, bean sheet"
  },
  "K4": {
   "asset": "lab/film/frames/K4.jpg",
   "note": "THE BEAN at rest on the front of the green-bean pile.",
   "refs": "green-bean still, bean sheet"
  },
  "K5": {
   "asset": "lab/film/frames/K5.jpg",
   "note": "The sorting table (existing story still).",
   "refs": ""
  },
  "K5a": {
   "asset": "lab/film/frames/K5a.jpg",
   "note": "A hand lifts a steel scoop of green beans from the table.",
   "refs": "K5"
  },
  "K5b": {
   "asset": "lab/film/frames/K5b.jpg",
   "note": "Cut on action: the same scoop pours into the roaster's hopper, in the roastery.",
   "refs": "K5a, roaster still"
  },
  "K6": {
   "asset": "lab/film/frames/K6.jpg",
   "note": "Through the drum window: green beans tumbling, THE BEAN in front.",
   "refs": "roaster still, bean sheet"
  },
  "K7": {
   "asset": "lab/film/frames/K7.jpg",
   "note": "The same view, the beans roasted chestnut brown.",
   "refs": "K6, roasted bean"
  },
  "K8": {
   "asset": "lab/film/frames/K8.jpg",
   "note": "The cooling tray, the arm turning (existing story still).",
   "refs": ""
  },
  "K8a": {
   "asset": "lab/film/frames/K8a.jpg",
   "note": "A hand lifts a scoop of roasted beans from the tray.",
   "refs": "K8"
  },
  "K8b": {
   "asset": "lab/film/frames/K8b.jpg",
   "note": "Cut on action: the same scoop pours into the grinder's hopper.",
   "refs": "K8a, grinder still"
  },
  "K9": {
   "asset": "lab/film/frames/K9.jpg",
   "note": "The grinder's chute: grounds fall into the portafilter (existing story still).",
   "refs": ""
  },
  "K10": {
   "asset": "lab/film/frames/K10.jpg",
   "note": "The barista brings the portafilter to the group head; the ivory cup waits.",
   "refs": "extraction still, grinder still"
  },
  "K11": {
   "asset": "lab/film/frames/K11.jpg",
   "note": "The full cup, natural crema, the last thread of espresso, a curl of steam.",
   "refs": "extraction still"
  },
  "K15": {
   "asset": "lab/film/frames/K15.jpg",
   "note": "At the window table by the entrance: a barista's hand lowers the cup on its saucer onto the marble.",
   "refs": [
    "K11"
   ]
  },
  "K16": {
   "asset": "lab/film/frames/K16.jpg",
   "note": "The same table, the cup at rest, steam rising. The glass entrance door behind, closed.",
   "refs": [
    "K15"
   ]
  },
  "KB1": {
   "asset": "lab/film/frames/KB1.jpg",
   "note": "Same shot: the guest, in from the street, sits at the table and looks at her coffee.",
   "refs": [
    "K16",
    "K13 (her look)"
   ]
  },
  "KC0": {
   "asset": "lab/film/frames/KC0.jpg",
   "note": "Closer: the same moment, her hand resting by the saucer, the handle turned to her.",
   "refs": [
    "KB1"
   ]
  },
  "KD1": {
   "asset": "lab/film/frames/KD1.jpg",
   "note": "After the first sip: the cup held by its handle at chest height, a quiet, private contentment. The film rests here.",
   "refs": [
    "KC0"
   ]
  },
  "KS1": {
   "asset": "lab/film/frames/KS1.jpg",
   "note": "She is already at the window table. The barista's hand brings the cup on its saucer down in front of her; she looks up at it.",
   "refs": [
    "KB1"
   ]
  }
 },
 "shots": [
  {
   "id": "S0",
   "title": "From the café",
   "from": "Kc",
   "to": "K0",
   "dur": 5,
   "join": "start",
   "file": "_source/film/shot-00.mp4",
   "camera": "Glides across the café to the bar and pushes into the coffee.",
   "action": "In extreme close-up the café dissolves through golden light into the coffee branch at origin: where it began.",
   "cut": "Ends on K0.",
   "prompt": "The camera glides slowly forward across the sunlit café towards the bar and pushes in past the espresso machine into the coffee beans; in extreme close-up the warm image softly dissolves through golden light into ripe red coffee cherries on a branch at golden hour on a coffee farm — the place where the coffee began. One continuous, dreamlike but realistic camera move, warm light throughout, no cuts.",
   "room": 1.3
  },
  {
   "id": "S1",
   "title": "The cherry",
   "from": "K0",
   "to": "K1",
   "dur": 5.04,
   "join": "match",
   "file": "_source/film/shot-01.mp4",
   "camera": "Slow push-in from the cluster to one cherry.",
   "action": "Leaves sway; low sun glows through the cherry's skin.",
   "cut": "Ends on K1.",
   "prompt": "Slow, steady push-in from the cluster of ripe coffee cherries on the branch to the single cherry nearest the camera, until it fills the centre of the frame. Leaves sway gently in a light breeze; low golden sun flickers through the canopy and glows through the translucent red skin; focus settles on that one cherry.",
   "room": 0.8
  },
  {
   "id": "S2",
   "title": "The cherry opens",
   "from": "K1",
   "to": "K2",
   "dur": 5,
   "join": "match",
   "file": "_source/film/shot-02.mp4",
   "camera": "Locked-off extreme macro.",
   "action": "The skin splits along the seam and peels back; two seeds in the pulp.",
   "cut": "Ends on K2.",
   "prompt": "Locked-off extreme macro of the ripe cherry: its glossy red skin slowly splits along the seam and peels back on both sides, revealing moist translucent cream pulp and two pale seeds pressed together; a bead of juice runs down.",
   "room": 1.1
  },
  {
   "id": "S3",
   "title": "The seed falls",
   "from": "K2",
   "to": "K3",
   "dur": 5,
   "join": "match",
   "file": "_source/film/shot-03.mp4",
   "camera": "Tilts down and follows the seed.",
   "action": "The left seed slips free and falls; the light lowers; the seed dries green-grey.",
   "cut": "Ends on K3.",
   "prompt": "The left seed slips free of the opened cherry and falls; the camera tilts down and follows it closely as it tumbles slowly through the air; the branch drifts out of frame above and goes soft; as it falls the light becomes lower and warmer and the seed dries to a matte green-grey coffee bean.",
   "room": 1.0
  },
  {
   "id": "S4",
   "title": "It joins the others",
   "from": "K3",
   "to": "K4",
   "dur": 5,
   "join": "match",
   "file": "_source/film/shot-04.mp4",
   "camera": "Keeps following the bean down.",
   "action": "It lands on the front of the pile, bounces, nudges its neighbours, settles.",
   "cut": "Ends on K4.",
   "prompt": "The camera keeps following the falling green coffee bean downward until an old wooden table with a pile of green coffee beans rises into frame; the bean lands on the front edge of the pile, bounces twice, nudges two neighbouring beans and settles with its crease facing up.",
   "room": 0.9
  },
  {
   "id": "S5",
   "title": "Sorted by hand",
   "from": "K4",
   "to": "K5",
   "dur": 5,
   "join": "match",
   "file": "_source/film/shot-05.mp4",
   "camera": "Rises and pulls back.",
   "action": "A hand spreads the beans and picks out a defective one.",
   "cut": "Ends on K5.",
   "prompt": "The camera rises and pulls back slowly from the single green coffee bean to reveal the whole pile on the old wooden sorting table; a worker's hand enters, gently spreads the beans, picks out one defective bean and withdraws.",
   "room": 0.7
  },
  {
   "id": "S6",
   "title": "The scoop",
   "from": "K5",
   "to": "K5a",
   "dur": 5,
   "join": "match",
   "file": "_source/film/shot-06.mp4",
   "camera": "Follows the scoop up.",
   "action": "A hand fills a steel scoop with green beans and lifts it.",
   "cut": "Ends on K5a; cut on action.",
   "prompt": "On the old wooden sorting table, a worker's hand pushes a brushed-steel scoop into the pile of green coffee beans and lifts it up heaped full; the camera follows the scoop as it rises.",
   "room": 0.6
  },
  {
   "id": "S7",
   "title": "Into the roaster",
   "from": "K5b",
   "to": "K6",
   "dur": 5.04,
   "join": "cut",
   "file": "_source/film/shot-07.mp4",
   "camera": "Follows the falling beans into the machine, pushes in to the window.",
   "action": "The same scoop pours the beans into the roaster; inside the drum they tumble.",
   "cut": "Ends on K6.",
   "prompt": "In the roastery, the hand tips the steel scoop and a stream of green coffee beans pours into the roaster's funnel hopper; the camera follows the falling beans down through the machine and pushes in to the round glass window of the drum, where the beans tumble inside the turning drum in a warm amber glow.",
   "room": 0.7
  },
  {
   "id": "S8",
   "title": "The roast",
   "from": "K6",
   "to": "K7",
   "dur": 9.92,
   "join": "soft",
   "file": "_source/film/shot-08.mp4",
   "camera": "Locked on the window.",
   "action": "The drum turns, the beans tumble and turn yellow, golden, then brown.",
   "cut": "Ends on K7.",
   "prompt": "Locked view through the round glass window of a coffee roaster: the steel drum turns steadily, its vane lifting the bed of coffee beans up the wall and letting them tumble back down under gravity. Over the shot the beans change colour gradually and evenly from pale green to yellow, to golden, to medium chestnut brown, and the amber glow deepens.",
   "room": 0.5
  },
  {
   "id": "S9",
   "title": "Out of the drum",
   "from": "K7",
   "to": "K8",
   "dur": 5,
   "join": "match",
   "file": "_source/film/shot-09-take2.mp4",
   "camera": "Pulls back and tilts down to the tray.",
   "action": "The door opens; roasted beans pour into the cooling tray; the arm turns.",
   "cut": "Ends on K8.",
   "prompt": "The camera pulls back from the roaster's glowing window and tilts down as the drum door opens and a stream of freshly roasted brown coffee beans pours out into the round black cooling tray below, where the stirring arm turns and spreads them; a little steam rises.",
   "room": 0.8
  },
  {
   "id": "S10",
   "title": "The roasted scoop",
   "from": "K8",
   "to": "K8a",
   "dur": 5,
   "join": "match",
   "file": "_source/film/shot-10.mp4",
   "camera": "Follows the scoop up.",
   "action": "A hand lifts a scoop of roasted beans from the tray.",
   "cut": "Ends on K8a; cut on action.",
   "prompt": "In the roastery, the stirring arm turns slowly in the round cooling tray of freshly roasted coffee beans; a hand enters and lifts a brushed-steel scoop heaped with roasted beans up out of the tray; the camera follows the scoop as it rises.",
   "room": 0.6
  },
  {
   "id": "S11",
   "title": "Into the grinder",
   "from": "K8b",
   "to": "K9",
   "dur": 5.04,
   "join": "cut",
   "file": "_source/film/shot-11.mp4",
   "camera": "Tilts down the grinder to the chute.",
   "action": "The same scoop pours into the hopper; the grinder runs; grounds fall into the portafilter.",
   "cut": "Ends on K9.",
   "prompt": "The hand pours the scoop of roasted coffee beans into the grinder's clear hopper; the grinder starts and the beans settle and sink; the camera tilts down the matte black body of the grinder to its chute, where fine dark grounds stream down under gravity into a stainless steel portafilter.",
   "room": 0.8
  },
  {
   "id": "S12",
   "title": "To the machine",
   "from": "K9",
   "to": "K10",
   "dur": 5,
   "join": "match",
   "file": "_source/film/shot-12.mp4",
   "camera": "Follows the portafilter to the machine.",
   "action": "The barista tamps and carries the portafilter to the group head.",
   "cut": "Ends on K10.",
   "prompt": "The grinder stops; a barista's hands take the stainless steel portafilter full of fresh grounds from under the grinder, level and tamp the coffee, and carry it across to the espresso machine, raising it to the group head; the camera follows the portafilter and settles on the machine, where an empty ivory cup on its saucer waits.",
   "room": 0.7
  },
  {
   "id": "S13",
   "title": "Extraction",
   "from": "K10",
   "to": "K11",
   "dur": 4.92,
   "join": "soft",
   "file": "_source/film/shot-13.mp4",
   "camera": "Holds on the cup.",
   "action": "Locked in; the stream flows; crema forms; steam.",
   "cut": "Ends on K11.",
   "prompt": "The barista's hands lock the portafilter into the group head with a firm quarter turn and withdraw; the first dark drops gather and a thin glossy stream of espresso flows down into the ivory cup; natural hazelnut crema forms and rises; a delicate curl of steam.",
   "room": 1.1
  },
  {
   "id": "S14",
   "title": "Served",
   "from": "K11",
   "to": "K11+",
   "dur": 1.5,
   "join": "match",
   "file": "_source/film/shot-14.mp4",
   "trim": [
    0,
    1.5417
   ],
   "camera": "Holds on the cup.",
   "action": "The last drops fall; a hand comes in and takes the saucer.",
   "cut": "Used up to the moment the hand holds the saucer (the rest of this take morphed the room, so it is cut away).",
   "prompt": "The last thread of espresso stops. A hand gently slides the full cup on its saucer along the counter towards the guest, then withdraws; the camera pulls back and settles low at the bar, and the warm café comes into view behind the cup, softly out of focus. The cup ends perfectly still; delicate steam rises.",
   "room": 1.0
  },
  {
   "id": "S15",
   "title": "Served at the window",
   "from": "KS1",
   "to": "KS1+",
   "dur": 5.04,
   "join": "cut",
   "file": "_source/film/shot-E2.mp4",
   "camera": "Locked off, at the window table by the entrance.",
   "action": "Cut on action: she is already sitting; the barista's hand sets the cup down in front of her and withdraws; she looks down at her coffee with a quiet smile.",
   "cut": "Cut on the hand holding the saucer. Used for its first 3.2 seconds: the cup is set down, she smiles at it.",
   "prompt": "Static locked-off shot, no camera movement. In real time, a barista's hand from the right sets the espresso cup and saucer down softly on the marble table in front of the seated woman, lets go and slides back out of frame to the right. She looks down at her coffee with a quiet, pleased smile and lays her hand near the saucer. Thin steam rises from the cup in the window light. Calm, natural, small movements; realistic anatomy and physics; the cup and saucer do not change shape; no morphing.",
   "model": "Kling 3.0 pro, 5 s (Krea)",
   "room": 1.5,
   "phoneX": 50
  },
  {
   "id": "S16",
   "title": "She lifts the cup",
   "from": "KC0",
   "to": "KC0+",
   "dur": 6.04,
   "join": "cut",
   "file": "_source/film/shot-F2.mp4",
   "camera": "Locked off, the window table, as before.",
   "action": "She reaches for the handle and lifts the cup.",
   "cut": "The wide part: the reach and the lift.",
   "prompt": "Locked-off static camera, no camera movement, no zoom, real time, calm and intimate. The coffee is very hot: soft, clearly visible white steam rises steadily from the cup the whole time, backlit by the window so every wisp glows against the darker brick wall. The woman slides her fingers through the handle and lifts the cup slowly to just under her nose; the steam curls up around the rim and drifts softly past her face as she closes her eyes and breathes the aroma in deeply, a small rise of her shoulders; then she takes one small, slow sip, lowers the cup a little and smiles quietly, the steam still rising from the cup. Small, natural, believable movements; the cup stays upright with realistic weight; the saucer stays still on the table. Realistic anatomy; no morphing of hands, cup or face; no exaggerated expressions.",
   "model": "Kling 3.0 pro, 6 s (Krea)",
   "room": 2.0,
   "phoneX": 42
  },
  {
   "id": "S17",
   "title": "The aroma",
   "from": "KC0",
   "to": "KC0+",
   "dur": 6.04,
   "join": "cut",
   "file": "_source/film/shot-F2-close.mp4",
   "camera": "The same take, closer (a 1.45x punch-in on her and the cup).",
   "action": "Cut in on the lift: the steam curls past her face, she breathes the aroma in, one small sip, a quiet smile.",
   "cut": "Same moment as S16, closer, so the steam and the smile read. The film ends on her smile.",
   "prompt": "(the same take as S16, cropped closer)",
   "model": "Kling 3.0 pro (Krea), cropped",
   "room": 2.2,
   "phoneX": 55
  }
 ],
 "pace": 11,
 "hold": 0.7,
 "cut": {
  "name": "umber-story",
  "note": "The autoplay film, about 30 seconds: the same shots, each played from its most telling moment. Speed changes ease in and out (speed [from, to]); places are joined by motion: the falling seed into the beans pouring into the roaster, the pour into the cooling tray into the pour into the grinder. The human moment at the end plays in real time.",
  "pieces": [
   {
    "shot": "S0",
    "in": 0,
    "out": 5,
    "speed": [
     1.4,
     2.6
    ],
    "join": "start",
    "why": "The café is the first frame; the camera moves in and dissolves through golden light to the cherries."
   },
   {
    "shot": "S2",
    "in": 0.3,
    "out": 2.6,
    "speed": 1.4,
    "join": "dissolve6",
    "chapter": 0,
    "why": "A soft cut in from the cluster to one cherry; it splits."
   },
   {
    "shot": "S3",
    "in": 1.0,
    "out": 3.2,
    "speed": 1.3,
    "join": "match",
    "why": "The seed slips free and falls."
   },
   {
    "shot": "S7",
    "in": 0,
    "out": 5.04,
    "speed": [
     1.7,
     2.1
    ],
    "join": "dissolve10",
    "chapter": 2,
    "why": "The falling seed carries on as green beans falling from the scoop into the roaster."
   },
   {
    "shot": "S8",
    "in": 0,
    "out": 9.92,
    "speed": 4.5,
    "join": "soft",
    "why": "A brief roast, as a time-lapse: green to brown."
   },
   {
    "shot": "S9",
    "in": 0.3,
    "out": 3.4,
    "speed": [
     1.6,
     1.25
    ],
    "join": "match",
    "why": "The drum opens and the roasted beans pour out with their weight; the camera settles."
   },
   {
    "shot": "S11",
    "in": 0,
    "out": 5.04,
    "speed": [
     1.6,
     2.0
    ],
    "join": "dissolve10",
    "chapter": 3,
    "why": "The pour into the tray becomes the pour into the grinder; grounds fall into the portafilter."
   },
   {
    "shot": "S12",
    "in": 0,
    "out": 5,
    "speed": 2.3,
    "join": "match",
    "why": "Tamped and carried to the machine."
   },
   {
    "shot": "S13",
    "in": 0,
    "out": 2.6,
    "speed": 1.6,
    "join": "soft",
    "chapter": 4,
    "why": "Locked in."
   },
   {
    "shot": "S13",
    "in": 2.6,
    "out": 4.92,
    "speed": 1,
    "join": "cont",
    "why": "The stream and the crema, in real time."
   },
   {
    "shot": "S15",
    "in": 0,
    "out": 2.0,
    "speed": 1,
    "join": "cut",
    "chapter": 5,
    "why": "Cut from the full cup at the bar: the barista sets it down in front of her; she is already sitting. Cut as his hand lets go."
   },
   {
    "shot": "S17",
    "in": 3.0,
    "out": 6.0,
    "speed": 1,
    "join": "cut",
    "why": "Straight from the cup being set down to her sip, close: the steam past her face, a smile. Two angles, not three."
   }
  ]
 }
}/*END*/;
