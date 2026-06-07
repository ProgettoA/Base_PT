/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("bookings");
  
  collection.fields.add(new NumberField({
    name: "numberOfClients",
    required: true,
    min: 1
  }));
  
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("bookings");
  collection.fields.removeByName("numberOfClients");
  return app.save(collection);
})