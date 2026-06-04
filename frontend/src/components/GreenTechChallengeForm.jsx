import React from "react";
import { X, Plus } from "lucide-react";

const GreenTechChallengeForm = ({
   title = "Create TAnnual Green Tech Challenge",
  formData,
  setFormData,
  onClose,
  onSave,
}) => {

  const addTeam = () => {
    setFormData({
      ...formData,
      teams: [
        ...(formData.teams || []),
        {
          teamName: "",
          position: "Participant",
        },
      ],
    });
  };

  const addStudent = () => {
    setFormData({
      ...formData,
      students: [
        ...(formData.students || []),
        {
          name: "",
          studentId: "",
          teamName: "",
        },
      ],
    });
  };

  const addPrize = () => {
    setFormData({
      ...formData,
      cashPrizes: [
        ...(formData.cashPrizes || []),
        {
          position: "",
          amount: "",
        },
      ],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100] px-4">

      <div className="bg-white w-full max-w-6xl rounded-xl p-8 shadow-xl max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">{title}</h2>

          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Event Info */}

        <div className="bg-white border rounded-xl p-5 mb-6">

          <h3 className="font-semibold text-[#2EA1F2] mb-4">
            Event Information
          </h3>

          <div className="grid md:grid-cols-3 gap-4">

           <div className="relative">
  <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
    Event Date
  </label>

  <input
    type="date"
    value={formData.eventDate || ""}
    onChange={(e) =>
      setFormData({
        ...formData,
        eventDate: e.target.value,
      })
    }
    className="border rounded-lg p-3 w-full"
  />
</div>

            <input
              placeholder="Theme"
              value={formData.theme || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  theme: e.target.value,
                })
              }
              className="border rounded-lg p-3"
            />

            <input
              placeholder="Venue"
              value={formData.venue || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  venue: e.target.value,
                })
              }
              className="border rounded-lg p-3"
            />

          </div>

        </div>

        {/* Teams */}

        <div className="bg-white border rounded-xl p-5 mb-6">

          <div className="flex justify-between mb-4">

            <h3 className="font-semibold text-[#2EA1F2]">
              Teams
            </h3>

            <button
              onClick={addTeam}
              className="bg-[#2EA1F2] text-white px-3 py-2 font-semibold rounded-lg flex items-center gap-2"
            >
              <Plus size={15} />
              Team
            </button>

          </div>

          {(formData.teams || []).map((team, idx) => (

            <div
              key={idx}
              className="grid md:grid-cols-2 gap-4 mb-3"
            >

              <input
                placeholder="Team Name"
                value={team.teamName}
                onChange={(e) => {
                  const teams = [...formData.teams];
                  teams[idx].teamName = e.target.value;

                  setFormData({
                    ...formData,
                    teams,
                  });
                }}
                className="border rounded-lg p-3"
              />

              <select
                value={team.position}
                onChange={(e) => {
                  const teams = [...formData.teams];
                  teams[idx].position = e.target.value;

                  setFormData({
                    ...formData,
                    teams,
                  });
                }}
                className="border rounded-lg p-3"
              >
                <option value="">Select</option>
                <option>Participant</option>
                <option>Winner</option>
                <option>1st Runners Up</option>
                <option>2nd Runners Up</option>
              </select>

            </div>
          ))}
        </div>

        {/* Students */}

        <div className="bg-white border rounded-xl p-5 mb-6">

          <div className="flex justify-between mb-4">

            <h3 className="font-semibold text-[#2EA1F2]">
              Students Participated
            </h3>

            <button
              onClick={addStudent}
              className="bg-[#2EA1F2] text-white px-3 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={15} />
              Student
            </button>

          </div>

          {(formData.students || []).map((student, idx) => (

            <div
              key={idx}
              className="grid md:grid-cols-3 gap-4 mb-3"
            >

              <input
                placeholder="Student Name"
                value={student.name}
                onChange={(e) => {
                  const students = [...formData.students];
                  students[idx].name = e.target.value;

                  setFormData({
                    ...formData,
                    students,
                  });
                }}
                className="border rounded-lg p-3"
              />

              <input
              type="number"
                placeholder="Student ID"
                value={student.studentId}
                onChange={(e) => {
                  const students = [...formData.students];
                  students[idx].studentId = e.target.value;

                  setFormData({
                    ...formData,
                    students,
                  });
                }}
                className="border rounded-lg p-3"
              />

              <select
                value={student.teamName}
                onChange={(e) => {
                  const students = [...formData.students];
                  students[idx].teamName = e.target.value;

                  setFormData({
                    ...formData,
                    students,
                  });
                }}
                className="border rounded-lg p-3"
              >
                <option value="">Select Team</option>

                {(formData.teams || []).map((team, i) => (
                  <option key={i} value={team.teamName}>
                    {team.teamName}
                  </option>
                ))}
              </select>

            </div>
          ))}
        </div>

        {/* Cash Prize */}

        <div className="bg-white border rounded-xl p-5 mb-6">

          <div className="flex justify-between mb-4">

            <h3 className="font-semibold text-[#2EA1F2]">
              Cash Prizes
            </h3>

            <button
              onClick={addPrize}
              className="bg-[#2EA1F2] text-white px-3 py-2 font-semibold rounded-lg flex items-center gap-2"
            >
              <Plus size={15} />
              Prize
            </button>

          </div>

          {(formData.cashPrizes || []).map((prize, idx) => (

            <div
              key={idx}
              className="grid md:grid-cols-2 gap-4 mb-3"
            >

              <select
                value={prize.position}
                onChange={(e) => {
                  const cashPrizes = [...formData.cashPrizes];
                  cashPrizes[idx].position = e.target.value;

                  setFormData({
                    ...formData,
                    cashPrizes,
                  });
                }}
                className="border rounded-lg p-3"
              >
                <option value="">Select Position</option>
                <option>Winner</option>
                <option>1st Runners Up</option>
                <option>2nd Runners Up</option>
                   <option>Consolation prize</option>
              </select>

              <input
                type="number"
                placeholder="Amount"
                value={prize.amount}
                onChange={(e) => {
                  const cashPrizes = [...formData.cashPrizes];
                  cashPrizes[idx].amount = e.target.value;

                  setFormData({
                    ...formData,
                    cashPrizes,
                  });
                }}
                className="border rounded-lg p-3"
              />

            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4">

          <button
            onClick={onClose}
            className="border px-6 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            className="bg-[#2EA1F2] text-white font-semibold px-6 py-2 rounded-lg"
          >
            Save
          </button>

        </div>

      </div>

    </div>
  );
};

export default GreenTechChallengeForm;