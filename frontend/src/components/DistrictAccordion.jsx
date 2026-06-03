import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2
} from "lucide-react";

import CommunityAccordion from "./CommunityAccordion";

const DistrictAccordion = ({
  district,
  districtIndex,
  formData,
  setFormData,
  onDelete
}) => {
  const [open, setOpen] = useState(true);

  //////////////////////////////////////////////////////
  // UPDATE DISTRICT
  //////////////////////////////////////////////////////

  const updateDistrictName = (value) => {
    const districts = [...formData.districts];

    districts[districtIndex].districtName = value;

    setFormData({
      ...formData,
      districts
    });
  };

  //////////////////////////////////////////////////////
  // COMMUNITYS
  //////////////////////////////////////////////////////

  const addCommunity = () => {
    const districts = [...formData.districts];

    districts[districtIndex].communities.push({
      communityName: "",
      income: "",
      members: [],
      products: []
    });

    setFormData({
      ...formData,
      districts
    });

    setOpen(true);
  };

  const removeCommunity = (communityIndex) => {
    const districts = [...formData.districts];

    districts[districtIndex].communities.splice(
      communityIndex,
      1
    );

    setFormData({
      ...formData,
      districts
    });
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">

      {/* HEADER */}

      <div
        onClick={() => setOpen(!open)}
        className="bg-gray-200  px-5 py-4 flex justify-between items-center cursor-pointer"
      >
        <div className="flex items-center gap-2">

          {open ? (
            <ChevronDown size={18} />
          ) : (
            <ChevronRight size={18} />
          )}

          <span className="font-semibold">
            {district.districtName ||
              `District ${districtIndex + 1}`}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="hover:text-red-600"
        >
          <Trash2 className="text-red-500" size={18} />
        </button>
      </div>

      {/* BODY */}

      {open && (
        <div className="p-5 space-y-5">

          {/* DISTRICT NAME */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District Name
            </label>

            <input
              type="text"
              value={district.districtName}
              onChange={(e) =>
                updateDistrictName(e.target.value)
              }
              placeholder="Enter district name"
              className="
                w-full
                border
                border-gray-300
                rounded-lg
                px-3
                py-2
                focus:outline-none
                focus:ring-2
                focus:ring-[#2EA1F2]
              "
            />
          </div>

          {/* COMMUNITY HEADER */}

          <div className="flex justify-between items-center">

            <h3 className="font-semibold text-gray-800">
              Communities
            </h3>

            <button
              type="button"
              onClick={addCommunity}
              className="
                bg-[#2EA1F2]
                text-white
                px-3
                py-2
                rounded-lg
                flex
                items-center
                gap-2
                hover:bg-[#1d8ddd]
                transition
              "
            >
              <Plus size={16} />
              Add Community
            </button>
          </div>

          {/* COMMUNITIES */}

          <div className="space-y-4">

            {district.communities.length === 0 ? (
              <div className="border border-dashed rounded-lg p-6 text-center text-gray-400">
                No communities added yet
              </div>
            ) : (
              district.communities.map(
                (community, communityIndex) => (
                  <CommunityAccordion
                    key={communityIndex}
                    community={community}
                    districtIndex={districtIndex}
                    communityIndex={communityIndex}
                    formData={formData}
                    setFormData={setFormData}
                    onDelete={() =>
                      removeCommunity(
                        communityIndex
                      )
                    }
                  />
                )
              )
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default DistrictAccordion;