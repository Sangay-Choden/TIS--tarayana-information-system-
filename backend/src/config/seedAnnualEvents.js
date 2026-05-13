const mongoose = require("mongoose");
const AnnualEvent = require("../models/annualEventModel");

const defaultEvents = [
  {
    eventName: "Tarayana Fair",
    fields: [
     { fieldName: "Title", fieldType: "text", required: true },
      { fieldName: "Event Date", fieldType: "date", required: true },

      { fieldName: "Total Income Earned By Community Members", fieldType: "number", required: false },
      { fieldName: "Theme", fieldType: "text", required: true },

      { fieldName: "Number Of Products", fieldType: "number", required: false },
      { fieldName: "Number Of Districts", fieldType: "number", required: false },
      { fieldName: "Number Of Community Members", fieldType: "number", required: false },

      { fieldName: "Number Of Community Stalls", fieldType: "number", required: false },
      { fieldName: "Number Of GameStalls", fieldType: "number", required: false },

        {
  fieldName: "Sponsors",
  fieldType: "array",
  required: false,
  itemFields: [
    { fieldName: "Name", fieldType: "text" },
    { fieldName: "Amount", fieldType: "number" }
  ]
}
    ]
  },
  {
    eventName: "Annual Green Tech Challenge",
    fields: [
      { fieldName: "Event Date", fieldType: "date", required: true },
      { fieldName: "Theme", fieldType: "text", required: true },

      { fieldName: "Number Of Students Participated", fieldType: "number", required: false },
      { fieldName: "Top Teams", fieldType: "text", required: false },

      { fieldName: "Venue", fieldType: "text", required: true },
      { fieldName: "Cash PrizeAmount", fieldType: "number", required: false }
    ]
  },
  {
    eventName: "Annual Pilgrimage",
    fields: [
      { fieldName: "Start Date", fieldType: "date", required: true },
      { fieldName: "End Date", fieldType: "date", required: true },


      { fieldName: "Pilgrimage Destination", fieldType: "text", required: true },

       {
      fieldName: "No of Senior Citizen Participated",
      fieldType: "array",
      required: false,
      itemFields: [
        { fieldName: "cid", fieldType: "text" },
        { fieldName: "name", fieldType: "text" }
      ]
    },

      { fieldName: "Coordinators", fieldType: "text", required: false },
     {
  fieldName: "Sponsors",
  fieldType: "array",
  required: false,
  itemFields: [
    { fieldName: "Name", fieldType: "text" },
    { fieldName: "Amount", fieldType: "number" }
  ]
}
    ]
  }
];

// ✅ THIS is what you call from server.js
const seedDefaultEvents = async () => {
  const MONGO_URI = process.env.DB_URI;

  if (!MONGO_URI) {
    throw new Error("DB_URI is not defined in environment variables");
  }

  await mongoose.connect(MONGO_URI);

  for (const event of defaultEvents) {
    const exists = await AnnualEvent.findOne({ eventName: event.eventName });

    if (!exists) {
      await AnnualEvent.create(event);
      console.log(`Created: ${event.eventName}`);
    } else {
      console.log(`Skipped (already exists): ${event.eventName}`);
    }
  }

  console.log("Seeding complete");
};

module.exports = seedDefaultEvents;