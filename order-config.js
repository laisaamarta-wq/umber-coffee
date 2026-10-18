/* ==========================================================================
   UMBER · how ordering works (one place for the checkout page and the server)
   Read by checkout.js,
   so the opening hours, the pickup times and the delivery price always agree.
   EVERYTHING HERE IS PROPOSED [CHECK]: opening hours, preparation time,
   delivery area, delivery price and the free-delivery threshold.
   ========================================================================== */
(function (root) {
  root.UMBER_ORDER = {
    currency: "eur",
    timeZone: "Europe/Riga",
    // opening hours by day of the week, 0 = Sunday … 6 = Saturday, [open, close] in hours
    hours: { 0: [9, 18], 1: [8, 19], 2: [8, 19], 3: [8, 19], 4: [8, 19], 5: [8, 19], 6: [9, 18] },
    prepMinutes: 10,        // the earliest a drink can be ready after ordering
    slotMinutes: 15,        // pickup times are offered every 15 minutes
    lastOrderMinutes: 15,   // no pickups in the last 15 minutes before closing
    delivery: {
      fee: 3.5,             // courier in Riga
      freeFrom: 30,         // free delivery from this order total
      beansOnly: true,      // drinks are for pickup only
      postcode: /^(LV-?)?1\d{3}$/i   // Riga postcodes LV-1001 … LV-1099 and the city's other 1xxx codes
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
