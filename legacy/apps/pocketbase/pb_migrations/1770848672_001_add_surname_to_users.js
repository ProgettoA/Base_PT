/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");
  
  collection.fields.add(new TextField({
    name: "surname",
    required: false,
    max: 255
  }));
  
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.fields.removeByName("surname");
  return app.save(collection);
})