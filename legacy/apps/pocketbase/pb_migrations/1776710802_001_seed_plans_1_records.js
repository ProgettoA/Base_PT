/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("plans");

  const record0 = new Record(collection);
    record0.set("planCode", "oto-1");
    record0.set("name", "One-Time Offer");
    record0.set("description", "One-time payment plan");
    record0.set("price", 99.99);
    record0.set("features", []);
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})