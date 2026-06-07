/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("plans");

  const record0 = new Record(collection);
    record0.set("planCode", "Mens_4");
    record0.set("description", "Abbonamento Mensile - 4 Lezioni");
    record0.set("price", 200);
    record0.set("stripePrice", 200);
    record0.set("online", 0);
    record0.set("active", 1);
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
    record1.set("planCode", "Mens_8");
    record1.set("description", "Abbonamento Mensile - 8 Lezioni");
    record1.set("price", 400);
    record1.set("stripePrice", 400);
    record1.set("online", 0);
    record1.set("active", 1);
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
    record2.set("planCode", "Trim_12");
    record2.set("description", "Abbonamento Trimestrale - 12 Lezioni");
    record2.set("price", 570);
    record2.set("stripePrice", 570);
    record2.set("online", 0);
    record2.set("active", 1);
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
    record3.set("description", "Abbonamento Trimestrale - 24 Lezioni");
    record3.set("price", 1000);
    record3.set("stripePrice", 1000);
    record3.set("online", 0);
    record3.set("active", 1);
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
    record4.set("planCode", "Sem_24");
    record4.set("description", "Abbonamento Semestrale - 24 Lezioni");
    record4.set("price", 1000);
    record4.set("stripePrice", 1000);
    record4.set("online", 0);
    record4.set("active", 1);
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
    record5.set("planCode", "Sem_48");
    record5.set("description", "Abbonamento Semestrale - 48 Lezioni");
    record5.set("price", 1900);
    record5.set("stripePrice", 1900);
    record5.set("online", 0);
    record5.set("active", 1);
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
    record6.set("planCode", "Intens");
    record6.set("description", "Abbonamento Intensivo");
    record6.set("price", 2400);
    record6.set("stripePrice", 2400);
    record6.set("online", 0);
    record6.set("active", 1);
  try {
    app.save(record6);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record7 = new Record(collection);
    record7.set("planCode", "Onl_Mens");
    record7.set("description", "Coaching online Mensile");
    record7.set("price", 90);
    record7.set("stripePrice", 90);
    record7.set("online", 1);
    record7.set("active", 1);
  try {
    app.save(record7);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record8 = new Record(collection);
    record8.set("planCode", "Trim_Mens");
    record8.set("description", "Coaching online Trimestrale");
    record8.set("price", 240);
    record8.set("stripePrice", 240);
    record8.set("online", 1);
    record8.set("active", 1);
  try {
    app.save(record8);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record9 = new Record(collection);
    record9.set("planCode", "Sem_Mens");
    record9.set("description", "Coaching online Semestrale");
    record9.set("price", 400);
    record9.set("stripePrice", 400);
    record9.set("online", 1);
    record9.set("active", 1);
  try {
    app.save(record9);
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