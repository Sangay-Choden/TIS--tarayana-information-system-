const mongoose = require("mongoose");
const AnnualEvent = require("../models/annualEventModel");

const defaultEvents = [
{
  eventName: "Tarayana Fair",
  fields: [
    { fieldName: "Title", fieldType: "text", required: true },
    { fieldName: "Start Date", fieldType: "date", required: true },
    { fieldName: "End Date", fieldType: "date", required: true },
    { fieldName: "Theme", fieldType: "text", required: true },
    { fieldName: "Venue", fieldType: "text", required: true },

    {
      fieldName: "Districts",
      fieldType: "array",
      required: false,
      itemFields: [
        {
          fieldName: "District Name",
          fieldType: "text"
        },
        {
          fieldName: "Communities",
          fieldType: "array",
          itemFields: [
            {
              fieldName: "Community Name",
              fieldType: "text"
            },
            {
              fieldName: "Community Members",
              fieldType: "array",
              itemFields: [
                {
                  fieldName: "CID",
                  fieldType: "number"
                },
                 {
                  fieldName: "Name",
                  fieldType: "text"
                }
              ]
            },
            {
              fieldName: "Products",
              fieldType: "array",
              itemFields: [
                {
                  fieldName: "Product Name",
                  fieldType: "text"
                }, {
              fieldName: "Income",
              fieldType: "number"
            }
              ]
            }
        
          ]
        }
      ]
    },

    {
      fieldName: "Game Stalls",
      fieldType: "array",
      required: false,
      itemFields: [
        {
          fieldName: "Game Name",
          fieldType: "text"
        },
        {
          fieldName: "Total Income Earned",
          fieldType: "number"
        }
      ]
    },

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
    {
      fieldName: "Event Date",
      fieldKey: "eventDate",
      fieldType: "date",
      required: true
    },
    {
      fieldName: "Theme",
      fieldKey: "theme",
      fieldType: "text",
      required: true
    },
    {
      fieldName: "Venue",
      fieldKey: "venue",
      fieldType: "text",
      required: true
    },

    {
      fieldName: "Teams",
      fieldKey: "teams",
      fieldType: "array",
      required: false,
      itemFields: [
        {
          fieldName: "Team Name",
          fieldKey: "teamName",
          fieldType: "text"
        },
        {
          fieldName: "Position",
          fieldKey: "position",
          fieldType: "text"
        }
      ]
    },

    {
      fieldName: "Students Participated",
      fieldKey: "students",
      fieldType: "array",
      required: false,
      itemFields: [
        {
          fieldName: "Name",
          fieldKey: "name",
          fieldType: "text"
        },
        {
          fieldName: "Student ID",
          fieldKey: "studentId",
          fieldType: "number"
        },
        {
          fieldName: "Team Name",
          fieldKey: "teamName",
          fieldType: "text"
        }
      ]
    },

    {
      fieldName: "Cash Prizes",
      fieldKey: "cashPrizes",
      fieldType: "array",
      required: false,
      itemFields: [
        {
          fieldName: "Position",
          fieldKey: "position",
          fieldType: "text"
        },
        {
          fieldName: "Amount",
          fieldKey: "amount",
          fieldType: "number"
        }
      ]
    }
  ]
},{
  eventName: "Tarayana Club",
  fields: [
    {
      fieldName: "School Name",
      fieldType: "text",
      required: true
    },
    {
      fieldName: "Dzongkhag",
      fieldType: "text",
      required: true
    },
    {
      fieldName: "Year of Establishment",
      fieldType: "number",
      required: true
    },
    {
      fieldName: "Focal Person",
      fieldType: "text",
      required: true
    },
    {
      fieldName: "Focal Contact Number",
      fieldType: "number",
      required: true
    },
    {
      fieldName: "Male Members",
      fieldType: "number",
      required: true
    },
    {
      fieldName: "Female Members",
      fieldType: "number",
      required: true
    }
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
        { fieldName: "cid", fieldType: "number" },
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