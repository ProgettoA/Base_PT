/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("plans");

  const record0 = new Record(collection);
    record0.set("planCode", "mock-test");
    record0.set("name", "Piano Test");
    record0.set("price", 9.99);
    record0.set("description", "Piano finto per testare il calendario");
    record0.set("features", ["Test feature 1", "Test feature 2", "Test feature 3"]);
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