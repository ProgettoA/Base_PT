/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");
  
  collection.fields.add(new SelectField({
    name: "role",
    values: ["user", "admin"]
  }));
  
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.fields.removeByName("role");
  return app.save(collection);
})