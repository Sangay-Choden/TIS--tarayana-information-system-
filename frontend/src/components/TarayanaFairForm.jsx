import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import DistrictAccordion from "./DistrictAccordion";

const TarayanaFairForm = ({
  formData,
  setFormData,
  onSave,
  onClose,
  title = "Create Tarayana Fair"
}) => {
  //////////////////////////////////////////////////////
  // BASIC INFO
  //////////////////////////////////////////////////////
const [errors, setErrors] = useState({});
  const updateField = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  //////////////////////////////////////////////////////
  // DISTRICTS
  //////////////////////////////////////////////////////

  const addDistrict = () => {
    setFormData({
      ...formData,
      districts: [
        ...(formData.districts || []),
        {
          districtName: "",
          communities: []
        }
      ]
    });
  };

  const removeDistrict = (districtIndex) => {
    const districts = [...(formData.districts || [])];

    districts.splice(districtIndex, 1);

    setFormData({
      ...formData,
      districts
    });
  };

  //////////////////////////////////////////////////////
  // GAME STALLS
  //////////////////////////////////////////////////////

  const addGameStall = () => {
    setFormData({
      ...formData,
      gameStalls: [
        ...(formData.gameStalls || []),
        {
          gameName: "",
          incomeEarned: ""
        }
      ]
    });
  };

  const removeGameStall = (index) => {
    const gameStalls = [...(formData.gameStalls || [])];

    gameStalls.splice(index, 1);

    setFormData({
      ...formData,
      gameStalls
    });
  };

  //////////////////////////////////////////////////////
  // SPONSORS
  //////////////////////////////////////////////////////

  const addSponsor = () => {
    setFormData({
      ...formData,
      sponsors: [
        ...(formData.sponsors || []),
        {
          name: "",
          amount: ""
        }
      ]
    });
  };

  const removeSponsor = (index) => {
    const sponsors = [...(formData.sponsors || [])];

    sponsors.splice(index, 1);

    setFormData({
      ...formData,
      sponsors
    });
  };
  const validate = () => {
  let newErrors = {};

  // ---------------------------
  // BASIC INFO
  // ---------------------------
  const requiredFields = ["title", "startDate", "endDate", "theme", "venue"];

  requiredFields.forEach((field) => {
    if (!formData[field] || formData[field].toString().trim() === "") {
      newErrors[field] = "This field is required";
    }
  });

  // ---------------------------
  // DISTRICTS
  // ---------------------------
  (formData.districts || []).forEach((d, di) => {
    if (!d.districtName?.trim()) {
      newErrors[`district_${di}`] = "District name required";
    }

    (d.communities || []).forEach((c, ci) => {
      if (!c.name?.trim()) {
        newErrors[`community_${di}_${ci}`] = "Community name required";
      }

      if (c.cid && !/^\d{11}$/.test(c.cid)) {
        newErrors[`cid_${di}_${ci}`] = "CID must be 11 digits";
      }
    });
  });

  // ---------------------------
  // GAME STALLS
  // ---------------------------
  (formData.gameStalls || []).forEach((g, i) => {
    if (!g.gameName?.trim()) {
      newErrors[`game_${i}`] = "Game name required";
    }

    if (g.incomeEarned === "" || isNaN(g.incomeEarned)) {
      newErrors[`income_${i}`] = "Income must be a number";
    } else if (Number(g.incomeEarned) < 0) {
      newErrors[`income_${i}`] = "Income cannot be negative";
    }
  });

  // ---------------------------
  // SPONSORS
  // ---------------------------
  (formData.sponsors || []).forEach((s, i) => {
    if (!s.name?.trim()) {
      newErrors[`sponsor_name_${i}`] = "Sponsor name required";
    }

    if (s.amount === "" || isNaN(s.amount)) {
      newErrors[`sponsor_amount_${i}`] = "Amount must be a number";
    } else if (Number(s.amount) <= 0) {
      newErrors[`sponsor_amount_${i}`] = "Amount must be greater than 0";
    }
  });

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

  //////////////////////////////////////////////////////
  // SAVE
  //////////////////////////////////////////////////////

const handleSave = () => {
//   const isValid = validate();

//   console.log("VALID?", isValid);
//   console.log("ERRORS", errors);

//   if (!isValid) return;

  onSave();
};

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100] px-4">
      <div className="bg-white w-full max-w-7xl rounded-2xl shadow-xl relative max-h-[90vh] overflow-y-auto">

        {/* HEADER */}

        <div className="sticky top-0 bg-white border-b px-8 py-5 z-10">
          <button
            onClick={onClose}
            className="absolute right-6 top-5 text-gray-500 hover:text-black text-2xl"
          >
            ✕
          </button>

          <h2 className="text-2xl font-bold text-gray-800">
            {title}
          </h2>
        </div>

        <div className="p-8 space-y-8">

          {/* BASIC INFORMATION */}

          <div className="bg-gray-50 border rounded-xl p-6">

            <h3 className="font-bold text-lg mb-5">
              Basic Information
            </h3>

            <div className="grid md:grid-cols-2 gap-4">

              <input
                className="border rounded-lg px-3 py-3"
                placeholder="Title"
                value={formData.title || ""}
                onChange={(e) =>
                  updateField("title", e.target.value)
                }
              />


            <div className="relative">
  <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
    Start Date
  </label>

  <input
    type="date"
    className="border rounded-lg px-3 py-3 w-full"
    value={formData.startDate || ""}
    onChange={(e) => updateField("startDate", e.target.value)}
  />
</div>

             <div className="relative">
  <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
    End Date
  </label>

  <input
    type="date"
    className="border rounded-lg px-3 py-3 w-full"
    value={formData.endDate || ""}
    onChange={(e) => updateField("endDate", e.target.value)}
  />
</div>

              <input
                className="border rounded-lg px-3 py-3"
                placeholder="Theme"
                value={formData.theme || ""}
                onChange={(e) =>
                  updateField("theme", e.target.value)
                }
              />

              <input
                className="border rounded-lg px-3 py-3 md:col-span-2"
                placeholder="Venue"
                value={formData.venue || ""}
                onChange={(e) =>
                  updateField("venue", e.target.value)
                }
              />
            </div>
          </div>

          {/* DISTRICTS */}

          <div className="space-y-4">

            <div className="flex justify-between items-center">

              <h3 className="text-lg font-semibold">
                Districts
              </h3>

              <button
                onClick={addDistrict}
                className="
                  bg-[#2EA1F2]
                  text-white
                  px-4
                  py-2
                  rounded-lg
                  flex
                  items-center
                  gap-2
                  hover:bg-[#1d8ddd]
                  font-semibold 
                "
              >
                <Plus size={18} />
                Add District
              </button>
            </div>

            {(formData.districts || []).length === 0 ? (
              <div className="border border-dashed rounded-xl p-10 text-center text-gray-400">
                No districts added yet
              </div>
            ) : (
              formData.districts.map(
                (district, districtIndex) => (
                  <DistrictAccordion
                    key={districtIndex}
                    district={district}
                    districtIndex={districtIndex}
                    formData={formData}
                    setFormData={setFormData}
                    onDelete={() =>
                      removeDistrict(
                        districtIndex
                      )
                    }
                  />
                )
              )
            )}
          </div>

          {/* GAME STALLS */}

          <div className="bg-white border rounded-xl p-6">

            <div className="flex justify-between items-center mb-5">

              <h3 className="font-semibold text-[#2EA1F2]">
                Game Stalls
              </h3>

              <button
                type="button"
                onClick={addGameStall}
                className="
                  bg-[#2EA1F2]
                  text-white
                  px-4
                  py-2
                  rounded-lg
                  flex
                  items-center
                  gap-2
                  font-semibold
                "
              >
                <Plus size={16} />
                Add Game Stall
              </button>
            </div>

            <div className="space-y-3">

              {(formData.gameStalls || []).map(
                (game, index) => (
                  <div
                    key={index}
                    className="grid md:grid-cols-2 gap-3 border rounded-lg p-3"
                  >
                    <input
                      placeholder="Game Name"
                      className="border rounded-lg px-3 py-2"
                      value={game.gameName}
                      onChange={(e) => {
                        const gameStalls = [
                          ...(formData.gameStalls ||
                            [])
                        ];

                        gameStalls[index].gameName =
                          e.target.value;

                        setFormData({
                          ...formData,
                          gameStalls
                        });
                      }}
                    />

                    <div className="flex gap-2">

                      <input
                        type="number"
                        placeholder="Income Earned"
                        className="flex-1 border rounded-lg px-3 py-2"
                        value={game.incomeEarned}
                        onChange={(e) => {
                          const gameStalls = [
                            ...(formData.gameStalls ||
                              [])
                          ];

                          gameStalls[
                            index
                          ].incomeEarned =
                            e.target.value;

                          setFormData({
                            ...formData,
                            gameStalls
                          });
                        }}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeGameStall(index)
                        }
                        className="text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* SPONSORS */}

          <div className="bg-white border rounded-xl p-6">

            <div className="flex justify-between items-center mb-5">

              <h3 className="font-semibold text-[#2EA1F2]">
                Sponsors
              </h3>

              <button
                type="button"
                onClick={addSponsor}
                className="
                  bg-[#2EA1F2]
                  text-white
                  px-4
                  py-2
                  rounded-lg
                  flex
                  items-center
                  gap-2
                    font-semibold
                "
              >
                <Plus size={16} />
                Add Sponsor
              </button>
            </div>

            <div className="space-y-3">

              {(formData.sponsors || []).map(
                (sponsor, index) => (
                  <div
                    key={index}
                    className="grid md:grid-cols-2 gap-3 border rounded-lg p-3"
                  >
                    <input
                      placeholder="Sponsor Name"
                      className="border rounded-lg px-3 py-2"
                      value={sponsor.name}
                      onChange={(e) => {
                        const sponsors = [
                          ...(formData.sponsors ||
                            [])
                        ];

                        sponsors[index].name =
                          e.target.value;

                        setFormData({
                          ...formData,
                          sponsors
                        });
                      }}
                    />

                    <div className="flex gap-2">

                      <input
                        type="number"
                        placeholder="Amount"
                        className="flex-1 border rounded-lg px-3 py-2"
                        value={sponsor.amount}
                        onChange={(e) => {
                          const sponsors = [
                            ...(formData.sponsors ||
                              [])
                          ];

                          sponsors[index].amount =
                            e.target.value;

                          setFormData({
                            ...formData,
                            sponsors
                          });
                        }}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeSponsor(index)
                        }
                        className="text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* FOOTER */}

          <div className="flex justify-end gap-4 pt-4">

            <button
              onClick={onClose}
              className="
                px-6
                py-3
                border
                rounded-lg
                font-medium
              "
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="
                px-6
                py-3
                bg-[#2EA1F2]
                text-white
                rounded-lg
                font-semibold
                hover:bg-[#1d8ddd]
              "
            >
              Save
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TarayanaFairForm;