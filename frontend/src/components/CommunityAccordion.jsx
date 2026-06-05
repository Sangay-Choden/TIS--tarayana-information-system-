import React, { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";

const CommunityAccordion = ({
  community,
  districtIndex,
  communityIndex,
  formData,
  setFormData,
  errors = {},
  onDelete
}) => {
  const [open, setOpen] = useState(true);

  // UTILITY INTERCEPTORS FOR STACK LOCKDOWN
  const blockNumbersAndSpecial = (e) => {
    // Allow navigation, deletion, and whitespace controls
    if (["Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight", "End", "Home", " "].includes(e.key)) {
      return;
    }
    // Block numbers and all symbols
    if (/[0-9\W_]/i.test(e.key) && e.key !== "-") {
      e.preventDefault();
    }
  };

  const blockTextAndSymbols = (e) => {
    // Allow navigation and deletion controls
    if (["Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight", "End", "Home"].includes(e.key)) {
      return;
    }
    // Block anything that isn't a digit
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const blockTextOnly = (e) => {
    // Allow navigation, deletion, and decimal point
    if (["Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight", "End", "Home", "."].includes(e.key)) {
      return;
    }
    // Block alphabetic characters
    if (/[a-zA-Z]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const updateCommunity = (field, value) => {
    const districts = [...formData.districts];
    districts[districtIndex].communities[communityIndex][field] = value;
    setFormData({ ...formData, districts });
  };

  const addMember = () => {
    const districts = [...formData.districts];
    if (!districts[districtIndex].communities[communityIndex].members) {
      districts[districtIndex].communities[communityIndex].members = [];
    }
    districts[districtIndex].communities[communityIndex].members.push({ name: "", cid: "" });
    setFormData({ ...formData, districts });
  };

  const removeMember = (memberIndex) => {
    const districts = [...formData.districts];
    districts[districtIndex].communities[communityIndex].members.splice(memberIndex, 1);
    setFormData({ ...formData, districts });
  };

  const addProduct = () => {
    const districts = [...formData.districts];
    if (!districts[districtIndex].communities[communityIndex].products) {
      districts[districtIndex].communities[communityIndex].products = [];
    }
    districts[districtIndex].communities[communityIndex].products.push({ productName: "", income: "" });
    setFormData({ ...formData, districts });
  };

  const removeProduct = (productIndex) => {
    const districts = [...formData.districts];
    districts[districtIndex].communities[communityIndex].products.splice(productIndex, 1);
    setFormData({ ...formData, districts });
  };

  const communityErrorKey = `community_${districtIndex}_${communityIndex}`;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* HEADER */}
      <div
        onClick={() => setOpen(!open)}
        className="bg-gray-200 text-gray-800 px-4 py-3 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <span className="font-semibold">
            {community.communityName || `Community ${communityIndex + 1}`}
          </span>
          {!open && Object.keys(errors).some(key => key.includes(`_${districtIndex}_${communityIndex}`)) && (
            <span className="h-2 w-2 rounded-full bg-red-200 animate-pulse" />
          )}
        </div>
        <Trash2 size={18} onClick={(e) => { e.stopPropagation(); onDelete(); }} className="cursor-pointer hover:text-red-200" />
      </div>

      {open && (
        <div className="p-5 space-y-6">
          {/* COMMUNITY INFO */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Community Name</label>
              <input
                className={`w-full border rounded-lg px-3 py-2 outline-none transition-colors ${
                  errors[communityErrorKey] ? "border-red-500 bg-red-50/30" : "border-gray-300 focus:border-blue-400"
                }`}
                value={community.communityName || ""}
                onKeyDown={blockNumbersAndSpecial}
                onChange={(e) => updateCommunity("communityName", e.target.value)}
                placeholder="e.g. Radhi Community"
              />
              {errors[communityErrorKey] && <span className="text-red-500 text-xs mt-1 block px-1">{errors[communityErrorKey]}</span>}
            </div>
          </div>

          {/* MEMBERS */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-gray-800">Members</h4>
              <button type="button" onClick={addMember} className="text-[#2EA1F2] hover:text-[#1d8ddd] flex items-center gap-1 text-sm font-medium">
                <Plus size={16} /> Add Member
              </button>
            </div>

            <div className="space-y-4">
              {(community.members || []).map((member, memberIndex) => {
                const memberNameKey = `member_name_${districtIndex}_${communityIndex}_${memberIndex}`;
                const memberCidKey = `cid_${districtIndex}_${communityIndex}_${memberIndex}`;

                return (
                  <div key={memberIndex} className="flex flex-col border border-gray-100 rounded-lg p-3 bg-gray-50/50 space-y-2">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <input
                          placeholder="Member Name"
                          className={`border rounded-lg px-3 py-2 bg-white outline-none focus:border-blue-400 ${
                            errors[memberNameKey] ? "border-red-500 bg-red-50/30" : "border-gray-300"
                          }`}
                          value={member.name || ""}
                          onKeyDown={blockNumbersAndSpecial}
                          onChange={(e) => {
                            const districts = [...formData.districts];
                            districts[districtIndex].communities[communityIndex].members[memberIndex].name = e.target.value;
                            setFormData({ ...formData, districts });
                          }}
                        />
                        {errors[memberNameKey] && <span className="text-red-500 text-xs mt-1 block">{errors[memberNameKey]}</span>}
                      </div>

                      <div className="flex gap-2 items-start">
                        <div className="flex-1 flex flex-col">
                          <input
                            placeholder="CID (11 Digits)"
                            maxLength={11}
                            className={`w-full border rounded-lg px-3 py-2 bg-white outline-none focus:border-blue-400 ${
                              errors[memberCidKey] ? "border-red-500 bg-red-50/30" : "border-gray-300"
                            }`}
                            value={member.cid || ""}
                            onKeyDown={blockTextAndSymbols}
                            onChange={(e) => {
                              const districts = [...formData.districts];
                              districts[districtIndex].communities[communityIndex].members[memberIndex].cid = e.target.value;
                              setFormData({ ...formData, districts });
                            }}
                          />
                          {errors[memberCidKey] && <span className="text-red-500 text-xs mt-1 block">{errors[memberCidKey]}</span>}
                        </div>
                        <button type="button" onClick={() => removeMember(memberIndex)} className="text-red-400 hover:text-red-600 pt-2 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PRODUCTS */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-gray-800">Products</h4>
              <button type="button" onClick={addProduct} className="text-[#2EA1F2] hover:text-[#1d8ddd] flex items-center gap-1 text-sm font-medium">
                <Plus size={16} /> Add Product
              </button>
            </div>

            <div className="space-y-4">
              {(community.products || []).map((product, productIndex) => {
                const prodNameKey = `product_name_${districtIndex}_${communityIndex}_${productIndex}`;
                const prodIncomeKey = `product_income_${districtIndex}_${communityIndex}_${productIndex}`;

                return (
                  <div key={productIndex} className="flex flex-col border border-gray-100 rounded-lg p-3 bg-gray-50/50 space-y-2">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <input
                          className={`border rounded-lg px-3 py-2 bg-white outline-none focus:border-blue-400 ${
                            errors[prodNameKey] ? "border-red-500 bg-red-50/30" : "border-gray-300"
                          }`}
                          placeholder="Product Name"
                          value={product.productName || ""}
                          onKeyDown={blockNumbersAndSpecial}
                          onChange={(e) => {
                            const districts = [...formData.districts];
                            districts[districtIndex].communities[communityIndex].products[productIndex].productName = e.target.value;
                            setFormData({ ...formData, districts });
                          }}
                        />
                        {errors[prodNameKey] && <span className="text-red-500 text-xs mt-1 block">{errors[prodNameKey]}</span>}
                      </div>

                      <div className="flex gap-2 items-start">
                        <div className="flex-1 flex flex-col">
                          <input
                            type="text"
                            placeholder="Income Generated"
                            className={`w-full border rounded-lg px-3 py-2 bg-white outline-none focus:border-blue-400 ${
                              errors[prodIncomeKey] ? "border-red-500 bg-red-50/30" : "border-gray-300"
                            }`}
                            value={product.income || ""}
                            onKeyDown={blockTextOnly}
                            onChange={(e) => {
                              const districts = [...formData.districts];
                              districts[districtIndex].communities[communityIndex].products[productIndex].income = e.target.value;
                              setFormData({ ...formData, districts });
                            }}
                          />
                          {errors[prodIncomeKey] && <span className="text-red-500 text-xs mt-1 block">{errors[prodIncomeKey]}</span>}
                        </div>
                        <button type="button" onClick={() => removeProduct(productIndex)} className="text-red-400 hover:text-red-600 pt-2 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default CommunityAccordion;