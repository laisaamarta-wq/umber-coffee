/* ==========================================================================
   UMBER · the menu and the coffee for home, in one place
   Edit names, recipes, prices, sizes and photos here; the page is built from it.
   EVERYTHING IN THIS FILE IS PROPOSED CONTENT [CHECK]: drinks, recipes, prices,
   sizes, bag weights, roast levels and tasting notes are suggestions for the
   café to confirm. They are not confirmed business facts.
   (The five coffees on the tasting wheel live in app.js; the same five are on the menu
   below as "Single origins", with the same names, prices and photos, so what the wheel
   offers can be found, seen and ordered on the menu too.)
   ========================================================================== */
window.UMBER_SHOP = {
  currency: "€",
  proposed: true,

  /* vessels: one family. Ceramic in the café, clear glass coffee mugs for iced drinks
     and the signature cups, paper cups with sleeves to take away. No plastic. */
  vessels: {
    espresso: "Ceramic espresso cup and saucer",
    cup: "Ceramic cup and saucer",
    low: "Low ceramic cup and saucer",
    mug: "Ceramic mug",
    glass: "Clear glass coffee mug",
    dessert: "Ribbed glass dessert cup",
    bowl: "Small ceramic bowl"
  },

  /* sizes and extras that several drinks share */
  options: {
    shot: [{ id: "single", label: "Single" }, { id: "double", label: "Double", add: 0.8 }],
    milk: [{ id: "regular", label: "Regular", note: "250 ml" }, { id: "large", label: "Large", note: "350 ml", add: 0.6 }],
    iced: [{ id: "regular", label: "Regular", note: "350 ml" }, { id: "large", label: "Large", note: "400 ml", add: 0.6 }]
  },

  filters: [
    { id: "all", label: "All drinks" },
    { id: "origin", label: "Single origins" },
    { id: "hot", label: "Hot drinks" },
    { id: "iced", label: "Iced coffee" },
    { id: "signature", label: "Signature drinks" },
    { id: "takeaway", label: "Takeaway" }
  ],

  /* temp: hot | iced · signature: true for the house creations · togo: can be taken away
     origin: one of the five single origins on the tasting wheel (photo: the wheel's own) */
  drinks: [
    { id: "origin-citrus", name: "Ethiopia Yirgacheffe pour-over", origin: "citrus", temp: "hot", vessel: "cup", togo: true, price: 4.2,
      line: "Bright as the first window of the day. Citrus zest, fresh acidity, lively finish.",
      recipe: ["Ethiopia Yirgacheffe, heirloom, washed", "Brewed by hand as a pour-over"] },
    { id: "origin-red-berry", name: "Kenya Nyeri filter", origin: "red-berry", temp: "hot", vessel: "cup", togo: true, price: 4.4,
      line: "Juicy and sharp, a little wild. Red berries, bright fruitiness, delicate acidity.",
      recipe: ["Kenya Nyeri, SL28 & SL34, washed", "Brewed as filter coffee"] },
    { id: "origin-honey", name: "Colombia Huila latte", origin: "honey", temp: "hot", vessel: "cup", togo: true, price: 4.6,
      line: "Round and golden, like noon on the counter. Honey, floral sweetness, soft caramel.",
      recipe: ["Colombia Huila, Caturra, honey process", "Espresso", "Steamed milk"] },
    { id: "origin-caramel", name: "Brazil Cerrado cortado", origin: "caramel", temp: "hot", vessel: "cup", togo: true, price: 3.9,
      line: "Slow sun on the bench, something sweet. Caramel, roasted hazelnut, milk chocolate.",
      recipe: ["Brazil Cerrado, Yellow Bourbon, natural", "Espresso", "A little steamed milk"] },
    { id: "origin-cocoa", name: "Sumatra Gayo espresso", origin: "cocoa", temp: "hot", vessel: "cup", togo: true, price: 3.2,
      line: "Lamps on. Deep, quiet, almost velvet. Cocoa, dark chocolate, roasted nuts.",
      recipe: ["Sumatra Gayo, Typica, wet-hulled", "A double shot of espresso"] },
    { id: "espresso", name: "Espresso", temp: "hot", vessel: "espresso", togo: true, price: 2.8, sizes: "shot",
      line: "Dense and sweet, with a thick hazelnut crema.",
      recipe: ["A shot of espresso"] },
    { id: "americano", name: "Americano", temp: "hot", vessel: "cup", togo: true, price: 3.2,
      line: "Espresso lengthened with hot water. Clean and long.",
      recipe: ["Espresso", "Hot water"] },
    { id: "cappuccino", name: "Cappuccino", temp: "hot", vessel: "cup", togo: true, price: 3.9, sizes: "milk",
      line: "Espresso under a deep, velvety layer of milk foam.",
      recipe: ["Espresso", "Steamed milk", "Milk foam"] },
    { id: "flat-white", name: "Flat white", temp: "hot", vessel: "low", togo: true, price: 4.2,
      line: "A double shot with thin, silky milk and latte art.",
      recipe: ["Double espresso", "Silky steamed milk"] },
    { id: "latte", name: "Latte", temp: "hot", vessel: "mug", togo: true, price: 4.2, sizes: "milk",
      line: "Espresso and plenty of steamed milk. Soft and round.",
      recipe: ["Espresso", "Steamed milk", "A thin layer of foam"] },
    { id: "mocha", name: "Mocha", temp: "hot", vessel: "mug", togo: true, price: 4.6, sizes: "milk",
      line: "Espresso, dark chocolate and steamed milk.",
      recipe: ["Espresso", "Dark chocolate", "Steamed milk"] },
    { id: "iced-latte", name: "Iced latte", temp: "iced", vessel: "glass", togo: true, price: 4.4, sizes: "iced",
      line: "Espresso poured over cold milk and ice, in layers.",
      recipe: ["Espresso", "Cold milk", "Ice"] },
    { id: "cold-brew", name: "Cold brew", temp: "iced", vessel: "glass", togo: true, price: 4.2, sizes: "iced",
      line: "Steeped slowly in cold water: smooth, low in bitterness.",
      recipe: ["Cold-brewed coffee", "Ice"] },

    /* new house creations: flavours you will not find on every corner */
    { id: "banana-cream-latte", name: "Banana cream latte", temp: "iced", vessel: "glass", signature: true, togo: true, price: 5.4, sizes: "iced",
      line: "Espresso through banana milk and ice, under a cloud of vanilla-banana foam.",
      recipe: ["Espresso", "Banana milk", "Ice", "Vanilla-banana cold foam", "Caramelised banana", "Cinnamon"] },
    { id: "cinnamon-affogato-latte", name: "Cinnamon affogato latte", temp: "hot", vessel: "dessert", signature: true, togo: false, price: 5.6,
      line: "A latte crowned with vanilla gelato, espresso poured over, cinnamon on top.",
      recipe: ["Cold milk", "Espresso", "Vanilla gelato", "Cinnamon"] },
    { id: "pistachio-white-hot-chocolate", name: "Pistachio white hot chocolate", temp: "hot", vessel: "glass", signature: true, togo: true, price: 5.2, sizes: "milk",
      line: "White chocolate and pistachio, whipped cream and a green pistachio drizzle.",
      recipe: ["White chocolate", "Pistachio cream", "Steamed milk", "Whipped cream", "Chopped pistachios"] },
    { id: "creme-brulee-latte", name: "Crème brûlée latte", temp: "hot", vessel: "glass", signature: true, togo: false, price: 5.6, sizes: "milk",
      line: "Vanilla custard cream with a torched sugar crust you crack with a spoon.",
      recipe: ["Espresso", "Steamed milk", "Vanilla custard cream", "Torched sugar crust"] },
    { id: "coconut-bonbon-latte", name: "Coconut bon-bon latte", temp: "hot", vessel: "glass", signature: true, togo: true, price: 5.4, sizes: "milk",
      line: "Like the coconut chocolate bar: dark chocolate, coconut milk, toasted coconut.",
      recipe: ["Espresso", "Dark chocolate sauce", "Coconut milk", "Coconut cream foam", "Toasted coconut"] },
    { id: "pumpkin-spice-matcha", name: "Pumpkin spice matcha", temp: "hot", vessel: "glass", signature: true, togo: true, price: 5.2, sizes: "milk",
      line: "Bright matcha over pumpkin spice oat milk. Our autumn green.",
      recipe: ["Matcha", "Pumpkin spice", "Oat milk", "Spiced cream", "Cinnamon and nutmeg"] },
    { id: "tiramisu-latte", name: "Tiramisu latte", temp: "hot", vessel: "glass", signature: true, togo: false, price: 5.6, sizes: "milk",
      line: "Espresso and milk under mascarpone cream and cocoa, with a ladyfinger.",
      recipe: ["Espresso", "Steamed milk", "Mascarpone cream", "Cocoa", "Savoiardi biscuit"] },
    { id: "black-sesame-honey-latte", name: "Black sesame honey latte", temp: "hot", vessel: "glass", signature: true, togo: true, price: 5.2, sizes: "milk",
      line: "Toasted black sesame, honey and espresso. Nutty, smoky, gently sweet.",
      recipe: ["Espresso", "Black sesame paste", "Honey", "Steamed milk", "Toasted sesame"] },

    { id: "salted-caramel-latte", name: "Salted caramel latte", temp: "hot", vessel: "mug", signature: true, togo: true, price: 4.9, sizes: "milk",
      line: "Espresso, steamed milk and salted caramel.",
      recipe: ["Espresso", "Steamed milk", "Salted caramel"] },
    { id: "vanilla-bean-latte", name: "Vanilla bean latte", temp: "hot", vessel: "mug", signature: true, togo: true, price: 4.8, sizes: "milk",
      line: "Espresso and milk with natural vanilla notes.",
      recipe: ["Espresso", "Steamed milk", "Vanilla"] },
    { id: "pistachio-latte", name: "Pistachio latte", temp: "iced", vessel: "glass", signature: true, togo: true, price: 5.2, sizes: "iced",
      line: "Espresso over pistachio cream and cold milk.",
      recipe: ["Espresso", "Pistachio cream", "Cold milk", "Ice", "Chopped pistachio (optional)"] },
    { id: "hazelnut-mocha", name: "Hazelnut mocha", temp: "hot", vessel: "glass", signature: true, togo: true, price: 5.1, sizes: "milk",
      line: "Espresso, chocolate, hazelnut and steamed milk.",
      recipe: ["Espresso", "Chocolate", "Hazelnut", "Steamed milk"] },
    { id: "honey-cinnamon-latte", name: "Honey cinnamon latte", temp: "hot", vessel: "cup", signature: true, togo: true, price: 4.9, sizes: "milk",
      line: "Espresso, honey and milk with a little cinnamon.",
      recipe: ["Espresso", "Honey", "Steamed milk", "A pinch of cinnamon"] },
    { id: "brown-sugar-iced-latte", name: "Brown sugar iced latte", temp: "iced", vessel: "glass", signature: true, togo: true, price: 4.9, sizes: "iced",
      line: "Espresso, cold milk and brown sugar over ice.",
      recipe: ["Espresso", "Brown sugar syrup", "Cold milk", "Ice"] },
    { id: "vanilla-cream-cold-brew", name: "Vanilla cream cold brew", temp: "iced", vessel: "glass", signature: true, togo: true, price: 4.9, sizes: "iced",
      line: "Cold brew under a slow-falling layer of vanilla cream.",
      recipe: ["Cold-brewed coffee", "Vanilla cream", "Ice"] },
    { id: "berry-espresso-tonic", name: "Berry espresso tonic", temp: "iced", vessel: "glass", signature: true, togo: true, price: 5.2,
      line: "Espresso floated on tonic and ice, with a hint of red berries.",
      recipe: ["Tonic water", "Red berry", "Ice", "Espresso"] },

    { id: "affogato", name: "Classic affogato", temp: "hot", vessel: "bowl", signature: true, togo: false, price: 5.4,
      line: "A shot of espresso poured over vanilla ice cream.",
      recipe: ["Vanilla ice cream", "Espresso"] }
  ],

  /* the showcase after the menu: four drinks with their own colour */
  showcase: [
    { id: "pistachio-latte", tone: "#8d9a6a", words: "Muted green, nutty and round." },
    { id: "berry-espresso-tonic", tone: "#7c2b3a", words: "Deep berry red under a dark crown of espresso." },
    { id: "vanilla-cream-cold-brew", tone: "#c9b08a", words: "Cream drifting slowly into cold brew." },
    { id: "hazelnut-mocha", tone: "#5a3424", words: "Chocolate, hazelnut and espresso, warm in the hand." }
  ],

  /* the takeaway family: paper cups, one identity */
  cups: [
    { id: "forest", name: "Forest cup", line: "Deep forest green with a ribbed green sleeve and a cream UMBER wordmark. For hot drinks.", sizes: "250 ml · 350 ml" },
    { id: "cream", name: "Cream cup", line: "Speckled cream paper with a ribbed cocoa-brown sleeve and an embossed UMBER. Hot or iced, to go.", sizes: "250 ml · 350 ml · 400 ml" },
    { id: "season", name: "Season cup", line: "The cream cup with a terracotta sleeve, for the autumn menu.", sizes: "350 ml" }
  ],

  /* coffee for home: whole beans, or ground to order */
  grind: [
    { id: "whole", label: "Whole bean" },
    { id: "espresso", label: "Ground for espresso" },
    { id: "filter", label: "Ground for filter" }
  ],
  beans: [
    { id: "house-blend", name: "House Blend", kind: "Blend", colour: "#2c3a2e",
      notes: ["Chocolate", "Caramel", "Nuts"], roast: "Medium", weight: "250 g", price: 13.5,
      line: "Smooth and balanced. Our everyday coffee, for espresso and milk.",
      brew: "Espresso, moka pot" },
    { id: "colombia", name: "Colombia Huila", kind: "Single origin", colour: "#c9b08e", wheel: 2,
      notes: ["Honey", "Floral", "Soft caramel"], roast: "Medium-light", weight: "250 g", price: 15,
      line: "Round and golden, sweet like honey. Lovely with milk.",
      brew: "Espresso, filter" },
    { id: "ethiopia", name: "Ethiopia Yirgacheffe", kind: "Single origin", colour: "#25221f", wheel: 0,
      notes: ["Citrus zest", "Floral", "Stone fruit"], roast: "Light", weight: "250 g", price: 16.5,
      line: "Fragrant and bright, like the first window of the day.",
      brew: "Pour-over, filter" },
    { id: "sumatra", name: "Sumatra Gayo", kind: "Single origin", colour: "#8a4a36", wheel: 4,
      notes: ["Cocoa", "Dark chocolate", "Roasted nuts"], roast: "Medium-dark", weight: "250 g", price: 15,
      line: "Deep and velvety, almost like cocoa.",
      brew: "Espresso, French press" },
    { id: "kenya", name: "Kenya Nyeri", kind: "Single origin", colour: "#6e2a35", wheel: 1,
      notes: ["Red berry", "Blackcurrant", "Grapefruit"], roast: "Light", weight: "250 g", price: 16.5,
      line: "Juicy and vivid, with a bright berry finish.",
      brew: "Pour-over, filter" },
    { id: "brazil", name: "Brazil Cerrado", kind: "Single origin", colour: "#b58a52", wheel: 3,
      notes: ["Caramel", "Roasted hazelnut", "Milk chocolate"], roast: "Medium", weight: "250 g", price: 13.5,
      line: "Sweet, soft and nutty. Lovely with milk.",
      brew: "Espresso, moka pot" },
    { id: "guatemala", name: "Guatemala", kind: "Single origin", colour: "#3c4f5c",
      notes: ["Cocoa", "Brown sugar", "Orange"], roast: "Medium", weight: "250 g", price: 15,
      line: "Rich and balanced, cocoa with a twist of orange.",
      brew: "Filter, espresso" },
    { id: "decaf", name: "Decaf", kind: "Decaf", colour: "#d6ccbd",
      notes: ["Milk chocolate", "Panela", "Red apple"], roast: "Medium", weight: "250 g", price: 14,
      line: "All the taste, for the evening cup.",
      brew: "Espresso, filter" }
  ],

  /* photos: one per product; until a photo exists the card shows a drawn stand-in */
  photo: {
    drink: (id) => id.startsWith("origin-") ? `assets/img/coffee-${id.slice(7)}-720.jpg` : `assets/img/menu/${id}.jpg`,
    bean: (id) => `assets/img/beans/${id}.jpg`,
    still: "assets/img/shop/takeaway-still.jpg",
    cups: "assets/img/shop/cups-family.jpg",
    showcase: "assets/img/shop/signature.jpg"
  }
};
