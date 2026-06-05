import React from "react";
import { X, Plus, Trash2 } from "lucide-react";

const GreenTechChallengeForm = ({
  title = "Create Annual Green Tech Challenge",
  formData,
  setFormData,
  onClose,
  onSave,
}) => {

  // INTERCEPTOR: Allow only letters, spaces, hyphens, and navigation keys
  const blockNumbersAndSpecial = (e) => {
    if (["Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight", "End", "Home", " "].includes(e.key)) {
      return;
    }
    // Block numbers and symbols (allowing hyphen)
    if (/[0-9\W_]/i.test(e.key) && e.key !== "-") {
      e.preventDefault();
    }
  };

  // INTERCEPTOR: Allow only numbers and navigation keys (for integer IDs)
  const blockTextAndSymbols = (e) => {
    if (["Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight", "End", "Home"].includes(e.key)) {
      return;
    }
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  // INTERCEPTOR: Allow numbers, decimal point, and navigation keys (for financial values)
  const blockTextOnly = (e) => {
    if (["Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight", "End", "Home", "."].includes(e.key)) {
      return;
    }
    if (/[a-zA-Z]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const addTeam = () => {
    setFormData({
      ...formData,
      teams: [
        ...(formData.teams || []),
        { teamName: "", position: "Participant" },
      ],
    });
  };

  const removeTeam = (idx) => {
    const teams = [...(formData.teams || [])];
    teams.splice(idx, 1);
    setFormData({ ...formData, teams });
  };

  const addStudent = () => {
    setFormData({
      ...formData,
      students: [
        ...(formData.students || []),
        { name: "", studentId: "", teamName: "" },
      ],
    });
  };

  const removeStudent = (idx) => {
    const students = [...(formData.students || [])];
    students.splice(idx, 1);
    setFormData({ ...formData, students });
  };

  const addPrize = () => {
    setFormData({
      ...formData,
      cashPrizes: [
        ...(formData.cashPrizes || []),
        { position: "", amount: "" },
      ],
    });
  };

  const removePrize = (idx) => {
    const cashPrizes = [...(formData.cashPrizes || [])];
    cashPrizes.splice(idx, 1);
    setFormData({ ...formData, cashPrizes });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100] px-4">
      <div className="bg-white w-full max-w-6xl rounded-xl p-8 shadow-xl max-h-[90vh] overflow-y-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* EVENT INFO */}
        <div className="bg-white border rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-[#2EA1F2] mb-4">Event Information</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-500 mb-1">Event Date</label>
              <input
                type="date"
                value={formData.eventDate || ""}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="border rounded-lg p-3 outline-none focus:border-blue-400 bg-white"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-500 mb-1">Theme</label>
              <input
                placeholder="Theme"
                value={formData.theme || ""}
                onKeyDown={blockNumbersAndSpecial} // Text-Only Intercept
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                className="border rounded-lg p-3 outline-none focus:border-blue-400 bg-white"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-500 mb-1">Venue</label>
              <input
                placeholder="Venue"
                value={formData.venue || ""}
                onKeyDown={blockNumbersAndSpecial} // Text-Only Intercept
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="border rounded-lg p-3 outline-none focus:border-blue-400 bg-white"
              />
            </div>
          </div>
        </div>

        {/* TEAMS */}
        <div className="bg-white border rounded-xl p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[#2EA1F2]">Teams</h3>
            <button
              onClick={addTeam}
              className="bg-[#2EA1F2] hover:bg-[#1d8ddd] text-white px-3 py-2 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors"
            >
              <Plus size={15} /> Team
            </button>
          </div>

          {(formData.teams || []).map((team, idx) => (
            <div key={idx} className="flex gap-3 items-start mb-3">
              <div className="grid md:grid-cols-2 gap-4 flex-1">
                <input
                  placeholder="Team Name"
                  value={team.teamName}
                  onKeyDown={blockNumbersAndSpecial} // Text-Only Intercept
                  onChange={(e) => {
                    const teams = [...formData.teams];
                    teams[idx].teamName = e.target.value;
                    setFormData({ ...formData, teams });
                  }}
                  className="border rounded-lg p-3 outline-none focus:border-blue-400 bg-white"
                />

                <select
                  value={team.position}
                  onChange={(e) => {
                    const teams = [...formData.teams];
                    teams[idx].position = e.target.value;
                    setFormData({ ...formData, teams });
                  }}
                  className="border rounded-lg p-3 outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">Select Position</option>
                  <option>Participant</option>
                  <option>Winner</option>
                  <option>1st Runners Up</option>
                  <option>2nd Runners Up</option>
                </select>
              </div>
              <button 
                type="button" 
                onClick={() => removeTeam(idx)} 
                className="text-red-400 hover:text-red-600 p-3 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* STUDENTS */}
        <div className="bg-white border rounded-xl p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[#2EA1F2]">Students Participated</h3>
            <button
              onClick={addStudent}
              className="bg-[#2EA1F2] hover:bg-[#1d8ddd] text-white px-3 py-2 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors"
            >
              <Plus size={15} /> Student
            </button>
          </div>

          {(formData.students || []).map((student, idx) => (
            <div key={idx} className="flex gap-3 items-start mb-3">
              <div className="grid md:grid-cols-3 gap-4 flex-1">
                <input
                  placeholder="Student Name"
                  value={student.name}
                  onKeyDown={blockNumbersAndSpecial} // Text-Only Intercept
                  onChange={(e) => {
                    const students = [...formData.students];
                    students[idx].name = e.target.value;
                    setFormData({ ...formData, students });
                  }}
                  className="border rounded-lg p-3 outline-none focus:border-blue-400 bg-white"
                />

                <input
                  placeholder="Student ID"
                  value={student.studentId}
                  onKeyDown={blockTextAndSymbols} // Numbers-Only Intercept
                  onChange={(e) => {
                    const students = [...formData.students];
                    students[idx].studentId = e.target.value;
                    setFormData({ ...formData, students });
                  }}
                  className="border rounded-lg p-3 outline-none focus:border-blue-400 bg-white"
                />

                <select
                  value={student.teamName}
                  onChange={(e) => {
                    const students = [...formData.students];
                    students[idx].teamName = e.target.value;
                    setFormData({ ...formData, students });
                  }}
                  className="border rounded-lg p-3 outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">Select Team</option>
                  {(formData.teams || []).map((t, i) => (
                    <option key={i} value={t.teamName}>
                      {t.teamName}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                type="button" 
                onClick={() => removeStudent(idx)} 
                className="text-red-400 hover:text-red-600 p-3 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* CASH PRIZES */}
        <div className="bg-white border rounded-xl p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[#2EA1F2]">Cash Prizes</h3>
            <button
              onClick={addPrize}
              className="bg-[#2EA1F2] hover:bg-[#1d8ddd] text-white px-3 py-2 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors"
            >
              <Plus size={15} /> Prize
            </button>
          </div>

          {(formData.cashPrizes || []).map((prize, idx) => (
            <div key={idx} className="flex gap-3 items-start mb-3">
              <div className="grid md:grid-cols-2 gap-4 flex-1">
                <select
                  value={prize.position}
                  onChange={(e) => {
                    const cashPrizes = [...formData.cashPrizes];
                    cashPrizes[idx].position = e.target.value;
                    setFormData({ ...formData, cashPrizes });
                  }}
                  className="border rounded-lg p-3 outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">Select Position</option>
                  <option>Winner</option>
                  <option>1st Runners Up</option>
                  <option>2nd Runners Up</option>
                  <option>Consolation prize</option>
                </select>

                <input
                  type="text" // Kept as text to safely leverage onKeyDown blocking while omitting default spinner controls
                  placeholder="Amount"
                  value={prize.amount}
                  onKeyDown={blockTextOnly} // Currency/Float Number Intercept
                  onChange={(e) => {
                    const cashPrizes = [...formData.cashPrizes];
                    cashPrizes[idx].amount = e.target.value;
                    setFormData({ ...formData, cashPrizes });
                  }}
                  className="border rounded-lg p-3 outline-none focus:border-blue-400 bg-white"
                />
              </div>
              <button 
                type="button" 
                onClick={() => removePrize(idx)} 
                className="text-red-400 hover:text-red-600 p-3 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="border border-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="bg-[#2EA1F2] hover:bg-[#1d8ddd] text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
};

export default GreenTechChallengeForm;