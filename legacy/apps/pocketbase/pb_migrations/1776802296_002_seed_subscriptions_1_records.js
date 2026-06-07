/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("subscriptions");

  const record0 = new Record(collection);
    const record0_userIdLookup = app.findFirstRecordByFilter("users", "name='Massimo' && surname='Pericolo'");
    if (!record0_userIdLookup) { throw new Error("Lookup failed for userId: no record in 'users' matching \"name='Massimo' && surname='Pericolo'\""); }
    record0.set("userId", record0_userIdLookup.id);
    record0.set("planId", "Mens_4");
    record0.set("status", "active");
    record0.set("startDate", "2026-04-21");
    record0.set("paymentDate", "2026-04-21");
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