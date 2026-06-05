import React, { useState, useEffect } from "react"; // <-- Added useEffect
import { Plus, Trash2 } from "lucide-react";
import DistrictAccordion from "./DistrictAccordion";

const TarayanaFairForm = ({
  formData,
  setFormData,
  onSave,
  onClose,
  title = "Create Tarayana Fair"
}) => {
  const [errors, setErrors] = useState({});

  // Clears the form state explicitly when this component is mounted (opened)
  useEffect(() => {
    setFormData({
      title: "",
      startDate: "",
      endDate: "",
      theme: "",
      venue: "",
      districts: [],
      gameStalls: [],
      sponsors: []
    });
    setErrors({}); // Clear old errors as well
  }, [setFormData]); // Runs once when the form modal mounts

  // UTILITY INTERCEPTORS FOR STACK LOCKDOWN
  const blockNumbersAndSpecial = (e) => {
    if (["Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight", "End", "Home", " "].includes(e.key)) {
      return;
    }
    if (/[0-9\W_]/i.test(e.key) && e.key !== "-") {
      e.preventDefault();
    }
  };

  const blockTextOnly = (e) => {
    if (["Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight", "End", "Home", "."].includes(e.key)) {
      return;
    }
    if (/[a-zA-Z]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const addDistrict = () => {
    setFormData({
      ...formData,
      districts: [...(formData.districts || []), { districtName: "", communities: [] }]
    });
  };

  const removeDistrict = (districtIndex) => {
    const districts = [...(formData.districts || [])];
    districts.splice(districtIndex, 1);
    setFormData({ ...formData, districts });
  };

  const addGameStall = () => {
    setFormData({
      ...formData,
      gameStalls: [...(formData.gameStalls || []), { gameName: "", incomeEarned: "" }]
    });
  };

  const removeGameStall = (index) => {
    const gameStalls = [...(formData.gameStalls || [])];
    gameStalls.splice(index, 1);
    setFormData({ ...formData, gameStalls });
  };

  const addSponsor = () => {
    setFormData({
      ...formData,
      sponsors: [...(formData.sponsors || []), { name: "", amount: "" }]
    });
  };

  const removeSponsor = (index) => {
    const sponsors = [...(formData.sponsors || [])];
    sponsors.splice(index, 1);
    setFormData({ ...formData, sponsors });
  };

  const validate = () => {
    let newErrors = {};
    const nameRegex = /^[A-Za-z\s\-]+$/;
    const numberRegex = /^\d+(\.\d+)?$/;

    const requiredFields = ["title", "startDate", "endDate", "theme", "venue"];
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        newErrors[field] = "This field is required";
      }
    });

    (formData.districts || []).forEach((d, di) => {
      if (!d.districtName?.trim()) {
        newErrors[`district_${di}`] = "District name required";
      } else if (!nameRegex.test(d.districtName.trim())) {
        newErrors[`district_${di}`] = "Letters only";
      }

      (d.communities || []).forEach((c, ci) => {
        if (!c.communityName?.trim()) {
          newErrors[`community_${di}_${ci}`] = "Community name required";
        } else if (!nameRegex.test(c.communityName.trim())) {
          newErrors[`community_${di}_${ci}`] = "Letters only";
        }

        (c.members || []).forEach((m, mi) => {
          if (!m.name?.trim()) {
            newErrors[`member_name_${di}_${ci}_${mi}`] = "Name required";
          } else if (!nameRegex.test(m.name.trim())) {
            newErrors[`member_name_${di}_${ci}_${mi}`] = "Letters only";
          }
          if (!m.cid || !/^\d{11}$/.test(m.cid)) {
            newErrors[`cid_${di}_${ci}_${mi}`] = "Must be 11 digits";
          }
        });

        (c.products || []).forEach((p, pi) => {
          if (!p.productName?.trim()) {
            newErrors[`product_name_${di}_${ci}_${pi}`] = "Product name required";
          } else if (!nameRegex.test(p.productName.trim())) {
            newErrors[`product_name_${di}_${ci}_${pi}`] = "Letters only";
          }
          if (!p.income || !numberRegex.test(p.income.toString().trim())) {
            newErrors[`product_income_${di}_${ci}_${pi}`] = "Valid income number required";
          }
        });
      });
    });

    (formData.gameStalls || []).forEach((g, i) => {
      if (!g.gameName?.trim()) {
        newErrors[`game_${i}`] = "Game name required";
      }
      if (!g.incomeEarned || !numberRegex.test(g.incomeEarned.toString().trim())) {
        newErrors[`income_${i}`] = "Valid number required";
      }
    });

    (formData.sponsors || []).forEach((s, i) => {
      if (!s.name?.trim()) {
        newErrors[`sponsor_name_${i}`] = "Sponsor name required";
      } else if (!nameRegex.test(s.name.trim())) {
        newErrors[`sponsor_name_${i}`] = "Letters only";
      }
      if (!s.amount || !numberRegex.test(s.amount.toString().trim()) || Number(s.amount) <= 0) {
        newErrors[`sponsor_amount_${i}`] = "Must be greater than 0";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100] px-4">
      <div className="bg-white w-full max-w-7xl rounded-2xl shadow-xl relative max-h-[90vh] overflow-y-auto">
        
        {/* HEADER */}
        <div className="sticky top-0 bg-white border-b px-8 py-5 z-10">
          <button onClick={onClose} className="absolute right-6 top-5 text-gray-500 hover:text-black text-2xl">✕</button>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>

        <div className="p-8 space-y-8">
          {/* BASIC INFORMATION */}
          <div className="bg-gray-50 border rounded-xl p-6">
            <h3 className="font-bold text-lg mb-5">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1 text-gray-700">Title</label>
                <input
                  className={`border rounded-lg px-3 py-3 bg-white outline-none focus:border-blue-400 ${errors.title ? "border-red-500 bg-red-50/30" : ""}`}
                  placeholder="Title"
                  value={formData.title || ""}
                  onKeyDown={blockNumbersAndSpecial}
                  onChange={(e) => updateField("title", e.target.value)}
                />
                {errors.title && <span className="text-red-500 text-xs mt-1 px-1">{errors.title}</span>}
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1 text-gray-700">Start Date</label>
                <input
                  type="date"
                  className={`border rounded-lg px-3 py-3 bg-white outline-none focus:border-blue-400 ${errors.startDate ? "border-red-500 bg-red-50/30" : ""}`}
                  value={formData.startDate || ""}
                  onChange={(e) => updateField("startDate", e.target.value)}
                />
                {errors.startDate && <span className="text-red-500 text-xs mt-1 px-1">{errors.startDate}</span>}
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1 text-gray-700">End Date</label>
                <input
                  type="date"
                  className={`border rounded-lg px-3 py-3 bg-white outline-none focus:border-blue-400 ${errors.endDate ? "border-red-500 bg-red-50/30" : ""}`}
                  value={formData.endDate || ""}
                  onChange={(e) => updateField("endDate", e.target.value)}
                />
                {errors.endDate && <span className="text-red-500 text-xs mt-1 px-1">{errors.endDate}</span>}
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1 text-gray-700">Theme</label>
                <input
                  className={`border rounded-lg px-3 py-3 bg-white outline-none focus:border-blue-400 ${errors.theme ? "border-red-500 bg-red-50/30" : ""}`}
                  placeholder="Theme"
                  value={formData.theme || ""}
                  onKeyDown={blockNumbersAndSpecial}
                  onChange={(e) => updateField("theme", e.target.value)}
                />
                {errors.theme && <span className="text-red-500 text-xs mt-1 px-1">{errors.theme}</span>}
              </div>

              <div className="flex flex-col md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700">Venue</label>
                <input
                  className={`border rounded-lg px-3 py-3 bg-white outline-none focus:border-blue-400 ${errors.venue ? "border-red-500 bg-red-50/30" : ""}`}
                  placeholder="Venue"
                  value={formData.venue || ""}
                  onKeyDown={blockNumbersAndSpecial}
                  onChange={(e) => updateField("venue", e.target.value)}
                />
                {errors.venue && <span className="text-red-500 text-xs mt-1 px-1">{errors.venue}</span>}
              </div>
            </div>
          </div>

          {/* DISTRICTS */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Districts</h3>
              <button onClick={addDistrict} className="bg-[#2EA1F2] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1d8ddd]">
                <Plus size={18} /> Add District
              </button>
            </div>

            {(formData.districts || []).length === 0 ? (
              <div className="border border-dashed rounded-xl p-10 text-center text-gray-400">No districts added yet</div>
            ) : (
              formData.districts.map((district, districtIndex) => (
                <DistrictAccordion
                  key={districtIndex}
                  district={district}
                  districtIndex={districtIndex}
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  onDelete={() => removeDistrict(districtIndex)}
                />
              ))
            )}
          </div>

          {/* GAME STALLS */}
          <div className="bg-white border rounded-xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-lg">Game Stalls</h3>
              <button type="button" onClick={addGameStall} className="bg-[#2EA1F2] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1d8ddd]">
                <Plus size={16} /> Add Game Stall
              </button>
            </div>

            <div className="space-y-4">
              {(formData.gameStalls || []).map((game, index) => (
                <div key={index} className="flex flex-col border rounded-lg p-3 bg-gray-50/50">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <input
                        placeholder="Game Name"
                        className={`border rounded-lg px-3 py-2 bg-white ${errors[`game_${index}`] ? "border-red-500 bg-red-50/30" : ""}`}
                        value={game.gameName}
                        onChange={(e) => {
                          const gameStalls = [...(formData.gameStalls || [])];
                          gameStalls[index].gameName = e.target.value;
                          setFormData({ ...formData, gameStalls });
                        }}
                      />
                      {errors[`game_${index}`] && <span className="text-red-500 text-xs mt-1">{errors[`game_${index}`]}</span>}
                    </div>

                    <div className="flex gap-2 items-start">
                      <div className="flex-1 flex flex-col">
                        <input
                          type="text"
                          placeholder="Income Earned"
                          className={`w-full border rounded-lg px-3 py-2 bg-white ${errors[`income_${index}`] ? "border-red-500 bg-red-50/30" : ""}`}
                          value={game.incomeEarned}
                          onKeyDown={blockTextOnly}
                          onChange={(e) => {
                            const gameStalls = [...(formData.gameStalls || [])];
                            gameStalls[index].incomeEarned = e.target.value;
                            setFormData({ ...formData, gameStalls });
                          }}
                        />
                        {errors[`income_${index}`] && <span className="text-red-500 text-xs mt-1">{errors[`income_${index}`]}</span>}
                      </div>
                      <button type="button" onClick={() => removeGameStall(index)} className="text-red-500 pt-2 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SPONSORS */}
          <div className="bg-white border rounded-xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-lg">Sponsors</h3>
              <button type="button" onClick={addSponsor} className="bg-[#2EA1F2] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1d8ddd]">
                <Plus size={16} /> Add Sponsor
              </button>
            </div>

            <div className="space-y-4">
              {(formData.sponsors || []).map((sponsor, index) => (
                <div key={index} className="flex flex-col border rounded-lg p-3 bg-gray-50/50">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <input
                        placeholder="Sponsor Name"
                        className={`border rounded-lg px-3 py-2 bg-white ${errors[`sponsor_name_${index}`] ? "border-red-500 bg-red-50/30" : ""}`}
                        value={sponsor.name}
                        onKeyDown={blockNumbersAndSpecial}
                        onChange={(e) => {
                          const sponsors = [...(formData.sponsors || [])];
                          sponsors[index].name = e.target.value;
                          setFormData({ ...formData, sponsors });
                        }}
                      />
                      {errors[`sponsor_name_${index}`] && <span className="text-red-500 text-xs mt-1">{errors[`sponsor_name_${index}`]}</span>}
                    </div>

                    <div className="flex gap-2 items-start">
                      <div className="flex-1 flex flex-col">
                        <input
                          type="text"
                          placeholder="Amount"
                          className={`w-full border rounded-lg px-3 py-2 bg-white ${errors[`sponsor_amount_${index}`] ? "border-red-500 bg-red-50/30" : ""}`}
                          value={sponsor.amount}
                          onKeyDown={blockTextOnly}
                          onChange={(e) => {
                            const sponsors = [...(formData.sponsors || [])];
                            sponsors[index].amount = e.target.value;
                            setFormData({ ...formData, sponsors });
                          }}
                        />
                        {errors[`sponsor_amount_${index}`] && <span className="text-red-500 text-xs mt-1">{errors[`sponsor_amount_${index}`]}</span>}
                      </div>
                      <button type="button" onClick={() => removeSponsor(index)} className="text-red-500 pt-2 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-4 pt-4">
            <button onClick={onClose} className="px-6 py-3 border rounded-lg font-medium hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} className="px-6 py-3 bg-[#2EA1F2] text-white rounded-lg font-semibold hover:bg-[#1d8ddd]">Save</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TarayanaFairForm;