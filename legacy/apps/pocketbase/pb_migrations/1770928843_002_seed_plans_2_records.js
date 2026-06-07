/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("plans");

  const record0 = new Record(collection);
    record0.set("name", "Piano Base");
    record0.set("description", "Perfect for getting started");
    record0.set("price", 9900);
    record0.set("features", ["10 sessioni al mese", "Supporto email", "Accesso app mobile"]);
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record1 = new Record(collection);
    record1.set("name", "Piano Pro");
    record1.set("description", "For serious trainers");
    record1.set("price", 19900);
    record1.set("features", ["Sessioni illimitate", "Supporto prioritario", "Analytics avanzate", "Accesso API"]);
  try {
    app.save(record1);
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