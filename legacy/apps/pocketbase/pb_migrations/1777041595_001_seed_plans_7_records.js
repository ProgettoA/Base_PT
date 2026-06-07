/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("plans");

  const record0 = new Record(collection);
    record0.set("planCode", "Intens");
    record0.set("description", "Intensive training program");
    record0.set("price", 299.99);
    record0.set("stripePrice", 29999);
    record0.set("NumLessions", 12);
    record0.set("online", true);
    record0.set("active", true);
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
    record1.set("planCode", "Sem_48");
    record1.set("description", "48-week training semester");
    record1.set("price", 199.99);
    record1.set("stripePrice", 19999);
    record1.set("NumLessions", 48);
    record1.set("online", true);
    record1.set("active", true);
  try {
    app.save(record1);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record2 = new Record(collection);
    record2.set("planCode", "Sem_24");
    record2.set("description", "24-week training semester");
    record2.set("price", 149.99);
    record2.set("stripePrice", 14999);
    record2.set("NumLessions", 24);
    record2.set("online", true);
    record2.set("active", true);
  try {
    app.save(record2);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record3 = new Record(collection);
    record3.set("planCode", "Trim_24");
    record3.set("description", "24-week trimester program");
    record3.set("price", 129.99);
    record3.set("stripePrice", 12999);
    record3.set("NumLessions", 24);
    record3.set("online", true);
    record3.set("active", true);
  try {
    app.save(record3);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record4 = new Record(collection);
    record4.set("planCode", "Trim_12");
    record4.set("description", "12-week trimester program");
    record4.set("price", 99.99);
    record4.set("stripePrice", 9999);
    record4.set("NumLessions", 12);
    record4.set("online", true);
    record4.set("active", true);
  try {
    app.save(record4);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record5 = new Record(collection);
    record5.set("planCode", "Mens_8");
    record5.set("description", "8-week monthly program");
    record5.set("price", 79.99);
    record5.set("stripePrice", 7999);
    record5.set("NumLessions", 8);
    record5.set("online", true);
    record5.set("active", true);
  try {
    app.save(record5);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record6 = new Record(collection);
    record6.set("planCode", "Mens_4");
    record6.set("description", "4-week monthly program");
    record6.set("price", 49.99);
    record6.set("stripePrice", 4999);
    record6.set("NumLessions", 4);
    record6.set("online", true);
    record6.set("active", true);
  try {
    app.save(record6);
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