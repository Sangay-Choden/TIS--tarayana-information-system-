import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2
} from "lucide-react";

const CommunityAccordion = ({
  community,
  districtIndex,
  communityIndex,
  formData,
  setFormData,
  onDelete
}) => {
  const [open, setOpen] = useState(true);

  const updateCommunity = (field, value) => {
    const districts = [...formData.districts];

    districts[districtIndex].communities[
      communityIndex
    ][field] = value;

    setFormData({
      ...formData,
      districts
    });
  };

  /////////////////////////////////////
  // MEMBERS
  /////////////////////////////////////

  const addMember = () => {
    const districts = [...formData.districts];

    districts[districtIndex].communities[
      communityIndex
    ].members.push({
      name: "",
      cid: ""
    });

    setFormData({
      ...formData,
      districts
    });
  };

  const removeMember = (memberIndex) => {
    const districts = [...formData.districts];

    districts[districtIndex].communities[
      communityIndex
    ].members.splice(memberIndex, 1);

    setFormData({
      ...formData,
      districts
    });
  };

  /////////////////////////////////////
  // PRODUCTS
  /////////////////////////////////////

  const addProduct = () => {
    const districts = [...formData.districts];

    districts[districtIndex].communities[
      communityIndex
    ].products.push({
      productName: "",
      income: "" // Initialized income inside product object
    });

    setFormData({
      ...formData,
      districts
    });
  };

  const removeProduct = (productIndex) => {
    const districts = [...formData.districts];

    districts[districtIndex].communities[
      communityIndex
    ].products.splice(productIndex, 1);

    setFormData({
      ...formData,
      districts
    });
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">

      {/* HEADER */}

      <div
        onClick={() => setOpen(!open)}
        className="text-[#2EA1F2] px-4 py-3 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown size={18} />
          ) : (
            <ChevronRight size={18} />
          )}

          <span className="font-semibold">
            {community.communityName ||
              `Community ${communityIndex + 1}`}
          </span>
        </div>

        <Trash2
          size={18}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="cursor-pointer hover:text-red-200"
        />
      </div>

      {open && (
        <div className="p-5 space-y-6">

          {/* COMMUNITY INFO */}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Community Name
              </label>

              <input
                className="w-full border rounded-lg px-3 py-2"
                value={community.communityName}
                onChange={(e) =>
                  updateCommunity(
                    "communityName",
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          {/* MEMBERS */}

          <div>
            <div className="flex justify-between items-center mb-3">

              <h4 className="font-semibold">
                Members
              </h4>

              <button
                type="button"
                onClick={addMember}
                className="text-[#2EA1F2] flex items-center gap-1"
              >
                <Plus size={16} />
                Add Member
              </button>
            </div>

            <div className="space-y-3">

              {community.members.map(
                (member, memberIndex) => (
                  <div
                    key={memberIndex}
                    className="grid md:grid-cols-2 gap-3 border rounded-lg p-3"
                  >
                    <input
                      placeholder="Name"
                      className="border rounded-lg px-3 py-2"
                      value={member.name}
                      onChange={(e) => {
                        const districts = [
                          ...formData.districts
                        ];

                        districts[districtIndex]
                          .communities[
                            communityIndex
                          ]
                          .members[
                            memberIndex
                          ].name =
                          e.target.value;

                        setFormData({
                          ...formData,
                          districts
                        });
                      }}
                    />

                    <div className="flex gap-2">
                      <input
                        placeholder="CID"
                        className="flex-1 border rounded-lg px-3 py-2"
                        value={member.cid}
                        onChange={(e) => {
                          const districts = [
                            ...formData.districts
                          ];

                          districts[districtIndex]
                            .communities[
                              communityIndex
                            ]
                            .members[
                              memberIndex
                            ].cid =
                            e.target.value;

                          setFormData({
                            ...formData,
                            districts
                          });
                        }}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeMember(memberIndex)
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

          {/* PRODUCTS */}

          <div>
            <div className="flex justify-between items-center mb-3">

              <h4 className="font-semibold">
                Products
              </h4>

              <button
                type="button"
                onClick={addProduct}
                className="text-[#2EA1F2] flex items-center gap-1"
              >
                <Plus size={16} />
                Add Product
              </button>
            </div>

            <div className="space-y-3">

              {community.products.map(
                (product, productIndex) => (
                  <div
                    key={productIndex}
                    className="grid md:grid-cols-2 gap-3 border rounded-lg p-3"
                  >
                    <input
                      className="border rounded-lg px-3 py-2"
                      placeholder="Product Name"
                      value={product.productName}
                      onChange={(e) => {
                        const districts = [
                          ...formData.districts
                        ];

                        districts[districtIndex]
                          .communities[
                            communityIndex
                          ]
                          .products[
                            productIndex
                          ].productName =
                          e.target.value;

                        setFormData({
                          ...formData,
                          districts
                        });
                      }}
                    />

                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Income"
                        className="flex-1 border rounded-lg px-3 py-2"
                        value={product.income || ""}
                        onChange={(e) => {
                          const districts = [
                            ...formData.districts
                          ];

                          districts[districtIndex]
                            .communities[
                              communityIndex
                            ]
                            .products[
                              productIndex
                            ].income =
                            e.target.value;

                          setFormData({
                            ...formData,
                            districts
                          });
                        }}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeProduct(productIndex)
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

        </div>
      )}
    </div>
  );
};

export default CommunityAccordion;