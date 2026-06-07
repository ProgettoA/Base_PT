/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("weekly_availability");

  const record0 = new Record(collection);
    record0.set("dayOfWeek", "Monday");
    record0.set("timeSlots", "{'slots': [{'startTime': '08:00', 'endTime': '10:00'}, {'startTime': '12:00', 'endTime': '15:00'}]}");
  app.save(record0);

  const record1 = new Record(collection);
    record1.set("dayOfWeek", "Tuesday");
    record1.set("timeSlots", "{'slots': [{'startTime': '08:00', 'endTime': '10:00'}, {'startTime': '15:00', 'endTime': '21:00'}]}");
  app.save(record1);

  const record2 = new Record(collection);
    record2.set("dayOfWeek", "Wednesday");
    record2.set("timeSlots", "{'slots': [{'startTime': '08:00', 'endTime': '11:00'}, {'startTime': '16:00', 'endTime': '20:00'}]}");
  app.save(record2);

  const record3 = new Record(collection);
    record3.set("dayOfWeek", "Thursday");
    record3.set("timeSlots", "{'slots': [{'startTime': '08:00', 'endTime': '10:00'}, {'startTime': '15:00', 'endTime': '20:00'}]}");
  app.save(record3);

  const record4 = new Record(collection);
    record4.set("dayOfWeek", "Friday");
    record4.set("timeSlots", "{'slots': [{'startTime': '08:00', 'endTime': '10:00'}, {'startTime': '15:00', 'endTime': '20:00'}]}");
  app.save(record4);

  const record5 = new Record(collection);
    record5.set("dayOfWeek", "Saturday");
    record5.set("timeSlots", "{'slots': [{'startTime': '08:00', 'endTime': '14:00'}]}");
  app.save(record5);

  const record6 = new Record(collection);
    record6.set("dayOfWeek", "Sunday");
    record6.set("timeSlots", "{'slots': []}");
  app.save(record6);
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})