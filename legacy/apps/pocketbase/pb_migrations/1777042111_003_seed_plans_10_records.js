/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("plans");

  const record0 = new Record(collection);
    record0.set("Codice_piano", "Mens_4");
    record0.set("Numero_lezioni", 4);
    record0.set("Descrizione", "Abbonamento Mensile - 4 Lezioni");
    record0.set("Prezzo", 200);
    record0.set("Prezzo_Stripe", 200);
    record0.set("Online", false);
    record0.set("Attivo", true);
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
    record1.set("Codice_piano", "Mens_8");
    record1.set("Numero_lezioni", 8);
    record1.set("Descrizione", "Abbonamento Mensile - 8 Lezioni");
    record1.set("Prezzo", 400);
    record1.set("Prezzo_Stripe", 400);
    record1.set("Online", false);
    record1.set("Attivo", true);
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
    record2.set("Codice_piano", "Trim_12");
    record2.set("Numero_lezioni", 12);
    record2.set("Descrizione", "Abbonamento Trimestrale - 12 Lezioni");
    record2.set("Prezzo", 570);
    record2.set("Prezzo_Stripe", 570);
    record2.set("Online", false);
    record2.set("Attivo", true);
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
    record3.set("Codice_piano", "Trim_24");
    record3.set("Numero_lezioni", 24);
    record3.set("Descrizione", "Abbonamento Trimestrale - 24 Lezioni");
    record3.set("Prezzo", 1000);
    record3.set("Prezzo_Stripe", 1000);
    record3.set("Online", false);
    record3.set("Attivo", true);
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
    record4.set("Codice_piano", "Sem_24");
    record4.set("Numero_lezioni", 24);
    record4.set("Descrizione", "Abbonamento Semestrale - 24 Lezioni");
    record4.set("Prezzo", 1000);
    record4.set("Prezzo_Stripe", 1000);
    record4.set("Online", false);
    record4.set("Attivo", true);
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
    record5.set("Codice_piano", "Sem_48");
    record5.set("Numero_lezioni", 48);
    record5.set("Descrizione", "Abbonamento Semestrale - 48 Lezioni");
    record5.set("Prezzo", 1900);
    record5.set("Prezzo_Stripe", 1900);
    record5.set("Online", false);
    record5.set("Attivo", true);
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
    record6.set("Codice_piano", "Intens");
    record6.set("Numero_lezioni", 72);
    record6.set("Descrizione", "Abbonamento Intensivo");
    record6.set("Prezzo", 2400);
    record6.set("Prezzo_Stripe", 2400);
    record6.set("Online", false);
    record6.set("Attivo", true);
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
    record7.set("Codice_piano", "Onl_Mens");
    record7.set("Numero_lezioni", 0);
    record7.set("Descrizione", "Coaching online Mensile");
    record7.set("Prezzo", 90);
    record7.set("Prezzo_Stripe", 90);
    record7.set("Online", true);
    record7.set("Attivo", true);
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
    record8.set("Codice_piano", "Trim_Onl");
    record8.set("Numero_lezioni", 0);
    record8.set("Descrizione", "Coaching online Trimestrale");
    record8.set("Prezzo", 240);
    record8.set("Prezzo_Stripe", 240);
    record8.set("Online", true);
    record8.set("Attivo", true);
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
    record9.set("Codice_piano", "Sem_Onl");
    record9.set("Numero_lezioni", 0);
    record9.set("Descrizione", "Coaching online Semestrale");
    record9.set("Prezzo", 400);
    record9.set("Prezzo_Stripe", 400);
    record9.set("Online", true);
    record9.set("Attivo", true);
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