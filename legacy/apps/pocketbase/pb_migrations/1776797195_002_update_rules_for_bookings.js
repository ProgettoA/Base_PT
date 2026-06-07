/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("bookings");
  collection.listRule = "clientId = @request.auth.id || @request.auth.role = \"admin\"";
  collection.viewRule = "clientId = @request.auth.id || @request.auth.role = \"admin\"";
  collection.createRule = "@request.auth.id != \"\"";
  collection.updateRule = "clientId = @request.auth.id || @request.auth.role = \"admin\"";
  collection.deleteRule = "clientId = @request.auth.id || @request.auth.role = \"admin\"";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("bookings");
  collection.createRule = "@request.auth.id != \"\"";
  collection.listRule = "@request.auth.id != \"\"";
  collection.viewRule = "@request.auth.id != \"\"";
  collection.updateRule = "@request.auth.id = clientId || @request.auth.role = \"admin\"";
  collection.deleteRule = "@request.auth.id = clientId || @request.auth.role = \"admin\"";
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})