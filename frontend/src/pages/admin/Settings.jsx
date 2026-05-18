import { useState } from "react";
import { useEffect } from "react";
import {
  Users,
  Shield,
  BadgeCheck,
  Plus,
  X,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import { Trash2 } from "lucide-react";
import hero from "../../assets/hero.png";

const Setting = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("banner");
  const [users, setUsers] = useState([]);
  // ROLE STATES
const [roles, setRoles] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");

const [loading, setLoading] = useState(false);

  // BANNER STATE
const [banner, setBanner] = useState(hero);
  const [imageURL, setImageURL] = useState("");
const [resetting, setResetting] = useState(false);

  const [deleteItem, setDeleteItem] = useState(null);
const [showSuccess, setShowSuccess] = useState(false);
const [successType, setSuccessType] = useState("");
const [selectedFile, setSelectedFile] = useState(null);
const [preview, setPreview] = useState("");
  // KPI DATA
  const [bgImage, setBgImage] = useState("");
const [showErrorPopup, setShowErrorPopup] = useState(false);
const [errorMessage, setErrorMessage] = useState("");

const roleColors = {
  Admin: "bg-red-100 text-red-500",
  "Programme Officer": "bg-blue-100 text-blue-500",
  "Field Officer": "bg-green-100 text-green-500",
  "M&E Officer": "bg-yellow-100 text-yellow-600",
  "C&D Officer": "bg-purple-100 text-purple-500",
  Management: "bg-gray-200 text-gray-600",
};

const formatRoleName = (name) => {
  if (name === "M&EOfficer") return "M&E Officer";
  if (name === "C&DOfficer") return "C&D Officer";

  return name?.replace(/([A-Z])/g, " $1").trim();
};

useEffect(() => {
  const fetchBanner = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/banner");
    const data = await res.json();

    console.log("BANNER API RESPONSE:", data);

    if (data && data.imageUrl) {
      setBgImage(data.imageUrl);
    } else {
      console.warn("No banner found in DB");
      setBgImage(""); // fallback
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
};

  fetchBanner();
}, []); 
const fetchUsers = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/auth/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) return;
// console.log(data.users)
    setUsers(data.users); 
  } catch (err) {
    console.error(err);
  }
};

const fetchRoles = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/roles/list", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) return;

    setRoles(data.roles);
  } catch (err) {
    console.error(err);
  }
};
useEffect(() => {
  fetchRoles();
  fetchUsers();
}, []);

const handleCreateRole = async () => {
  if (!roleName.trim()) return;

  try {
     setLoading(true);

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/roles/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        roleName,
        roleDescription: roleDesc,
      }),
    });

    const data = await res.json();
    

    if (!res.ok) {
      setLoading(false);
      return alert(data.message);}

    // refresh roles from backend
    fetchRoles();

    setShowModal(false);
    setRoleName("");
    setRoleDesc("");

    setSuccessType("role");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    setLoading(false);

  } catch (err) {
    setLoading(false);
    console.error(err);
  }
};

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setSelectedFile(file);

  const previewUrl = URL.createObjectURL(file);
  setPreview(previewUrl);
};

const confirmDelete = async () => {
  try {
    const token = localStorage.getItem("token");

    const roleId = roles[deleteItem]._id;

    const res = await fetch(
      `http://localhost:5000/api/roles/delete/${roleId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) return alert(data.message);

    fetchRoles(); // refresh

    setDeleteItem(null);
  } catch (err) {
    console.error(err);
  }
};
const handleSaveBanner = async () => {

  if (!selectedFile) {
    setErrorMessage("Please select an image first.");
    setShowErrorPopup(true);

    setTimeout(() => {
      setShowErrorPopup(false);
    }, 2000);

    return;
  }

  try {

    // START LOADING
    setLoading(true);

    const formData = new FormData();
    formData.append("image", selectedFile);

    const res = await fetch(
      "http://localhost:5000/api/banner/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    // ERROR
    if (!res.ok) {

      setLoading(false);

      setErrorMessage("Upload failed. Please try again.");
      setShowErrorPopup(true);

      setTimeout(() => {
        setShowErrorPopup(false);
      }, 2000);

      return;
    }

    // SUCCESS
    setBgImage(data.imageUrl);

    setPreview("");
    setSelectedFile(null);

    setSuccessType("banner");
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);

    // STOP LOADING
    setLoading(false);

  } catch (err) {

    setLoading(false);

    setErrorMessage("Something went wrong.");
    setShowErrorPopup(true);

    setTimeout(() => {
      setShowErrorPopup(false);
    }, 2000);

    console.error(err);
  }
};

const handleResetDefault = async () => {
  try {

    setResetting(true);

    setBgImage(hero);
    setPreview("");
    setSelectedFile(null);
    setImageURL("");

    const formData = new FormData();

    const response = await fetch(hero);
    const blob = await response.blob();

    formData.append(
      "image",
      new File([blob], "hero.png", { type: blob.type })
    );

    await fetch("http://localhost:5000/api/banner/upload", {
      method: "POST",
      body: formData,
    });

    setSuccessType("reset");
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);

    setResetting(false);

  } catch (err) {

    setResetting(false);

    setErrorMessage("Failed to reset banner.");
    setShowErrorPopup(true);

    setTimeout(() => {
      setShowErrorPopup(false);
    }, 2000);

    console.error(err);
  }
};


  return (
    <>
<div className="w-full px-2 sm:px-2 lg:px-2 pb-6 space-y-6 overflow-x-hidden">

  

      {/* Main */}
<div className="w-full ">
  <div className="space-y-6">

          {/* HEADER */}
          {/* <div>
            <h2 className="text-xl font-semibold">Setting</h2>
            <p className="text-sm text-gray-500">Roles & access control</p>
          </div> */}

          {/* KPI */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="text-blue-500" size={20} />
              </div>
              <div>
                <p className="font-semibold text-lg">{users.length}</p>
                <p className="text-sm text-gray-500">Total Users</p>
              </div>
            </div> */}

            {/* <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Shield className="text-green-500" size={20} />
              </div>
              <div>
                <p className="font-semibold text-lg">{activeUsers}</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div> */}

            {/* <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <BadgeCheck className="text-yellow-500" size={20} />
              </div>
              <div>
                <p className="font-semibold text-lg">{roles.length}</p>
                <p className="text-sm text-gray-500">Roles</p>
              </div>
            </div>
          </div> */}

          {/* TABS */}
          {/* TABS */}
{/* TABS */}
<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

  {/* TAB SWITCH */}
  <div className="flex flex-wrap w-full sm:w-auto">

    {/* ROLES TAB */}
    {/* <button
      onClick={() => setActiveTab("roles")}
      className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition
        ${activeTab === "roles"
          ? "bg-[#2EA1F2] text-white shadow"
          : "text-gray-500 hover:bg-gray-100"}
      `}
    >
      <Shield size={16} />
      Roles
    </button> */}

    {/* BANNER TAB */}
    {/* <div
      onClick={() => setActiveTab("banner")}
      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 font-semibold text-gray-700 flex items-center justify-center gap-2 transition"
    >
   
    <div className="bg-blue-100 p-3 rounded-lg">
      <ImageIcon size={20} className="text-[#2EA1F2]  " /></div>
      Banner Login
    </div> */}
<div className="flex items-center gap-3 mb-4">
  <div className="bg-blue-100 p-3 rounded-xl">
    <ImageIcon size={20} className="text-[#2EA1F2]" />
  </div>
  <div>
    <h2 className="font-semibold text-lg text-gray-800">
      Login Banner
    </h2>
    <p className="text-xs text-gray-500">
      Customize the login page background
    </p>
  </div>
</div>

  </div>

  {/* BUTTON */}
  {activeTab === "roles" && (
    <button
      onClick={() => setShowModal(true)}
      className="w-full sm:w-auto bg-[#2EA1F2] text-white px-4 py-2 text-sm shadow font-bold rounded-lg flex justify-center items-center gap-2 hover:bg-[#298CD2] transition-colors"
    >
      <Plus size={16} /> Create Role
    </button>
  )}

</div>

          {/* ROLES */}
          {activeTab === "roles" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {roles.map((role, i) => (
  <div key={role._id} className="bg-white p-4 rounded-xl shadow relative">

   <Trash2
  size={15}
  className="absolute top-3 right-3 text-[#AA3333] cursor-pointer z-10 hover:scale-110"
  onClick={() => setDeleteItem(i)}
/>

    <div className="flex items-center gap-3">
      {/* <div className="p-3 rounded-lg bg-blue-100 text-blue-500"> */}
<div
  className={`p-3 rounded-lg ${
    roleColors[role.roleName] || "bg-gray-100 text-gray-500"
  }`}
>
        <Shield size={18} />
      </div>

      <div>
        {/* <h3 className="font-semibold">{role.roleName}</h3> */}
         <h3 className="font-semibold">
    {formatRoleName(role.roleName)}
  </h3>
        <p className="text-xs text-gray-400">
          {/* Built-in / Custom */}
        </p>
      </div>
    </div>

    <p className="text-sm text-gray-500 mt-3">
      {role.roleDescription}
    </p>
  </div>
))}
            </div>
          )}

          {/* BANNER LOGIN */}
          {activeTab === "banner" && (
            <div className="bg-white p-6 rounded-xl shadow space-y-6">

              {/* Preview */}
              <div className="relative">
               <img
  src={preview || bgImage}
  alt="banner"
  className="rounded-xl w-full h-72 md:h-80 lg:h-96 object-cover"
/>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/80 backdrop-blur px-8 py-8 rounded-xl text-center shadow">
                    <ImageIcon className="mx-auto text-blue-500 mb-2" />
                    <p className="font-medium">Login Preview</p>
                    <p className="text-xs text-gray-500">
                      This is how login page will look
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload */}
              <div>
                <p className="text-sm mb-2">Upload Image</p>
 <label className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-blue-50">
  <Upload className="mb-3 text-gray-400 group-hover:text-blue-500" size={28} />
  <p className="text-sm font-medium text-gray-600">
    Drag & drop or click to upload
  </p>
  <p className="text-xs text-gray-400 mt-1">
    JPG, PNG (Recommended: 1920x600)
  </p>

  <input
    type="file"
    className="hidden"
    onChange={handleImageUpload}
  />
</label>
              </div>

              {/* URL */}
              <div>
                <p className="text-sm mb-2">Or Image URL</p>
                <input
                  type="text"
                  value={imageURL}
                  onChange={(e) => {
                    setImageURL(e.target.value);
                    setBanner(e.target.value);
                  }}
                  placeholder="Enter image url link"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              {/* ACTIONS */}
              {/* <div className="flex justify-end gap-3">
                <button className="border px-4 py-2 rounded-lg">
                  Reset Default
                </button>
                            <button
                // onClick={() => {
                //     setSuccessType("banner");
                //     setShowSuccess(true);
                //     setTimeout(() => setShowSuccess(false), 2000);
                // }}
                onClick={handleSaveBanner}
               className="ml-4 bg-[#2EA1F2] text-white px-5 py-2 shadow font-bold text-md rounded-lg flex items-center gap-2 hover:bg-[#298CD2] transition-color"
                >
                Save Banner
                </button>
              </div> */}

              <div className="flex justify-between items-center mt-4">
<button
  onClick={handleResetDefault}
  disabled={resetting}
  className="text-sm text-gray-500 hover:text-red-500 transition"
>
  {resetting ? "Resetting..." : "Reset Default"}
</button>


  <button
  type="button"
    onClick={handleSaveBanner}
    disabled={loading}
   className="ml-4 bg-[#2EA1F2] text-white px-5 py-2 shadow font-bold text-md rounded-lg flex items-center gap-2 hover:bg-[#298CD2] transition-color"
  >
    {loading ? "Saving changes..." : " Save Changes "}
  </button>

</div>
            </div>
          )}
        </div>
      </div>

</div>
     {showSuccess && (
  <div className="fixed inset-0 flex items-center justify-center z-[100]">
    
    {/* Overlay */}
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

    {/* Card */}
 <div className="relative bg-white rounded-xl shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-center w-full max-w-xl animate-popup">
      {/* Circle + Tick */}
      <div className="flex items-center justify-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pop">
          
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="tick-path"
              />
            </svg>
          </div>

        </div>
      </div>

      {/* TEXT */}
      <h2 className="text-xl font-semibold text-gray-700">
       {successType === "role"
  ? "Role Created Successfully"
  : successType === "reset"
  ? "Banner Reset Successfully"
  : "Banner Updated Successfully"}
      </h2>

      <p className="text-gray-500 mt-2 text-sm">
       {successType === "role"
  ? "The new role has been created and is now available to assign to users."
  : successType === "reset"
  ? "The default banner image has been restored successfully."
  : "The banner has been updated and the latest changes are now visible."}
      </p>
    </div>
  </div>
)}

{deleteItem !== null && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100]">
    <div className="bg-white rounded-xl p-6 w-full max-w-xl shadow">
      <h2 className="text-lg font-semibold mb-2">Delete Role?</h2>
      <p className="text-gray-500 text-sm mb-6">
        Are you sure you want to delete this role? This action is permanent and cannot be undone.
      </p>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => setDeleteItem(null)}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={confirmDelete}
          className="px-4 py-2 bg-[#AA3333] text-white rounded-lg"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

{showErrorPopup && (
  <div className="fixed inset-0 flex items-center justify-center z-[100]">

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

    {/* Card */}
 <div className="relative bg-white rounded-xl shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-center w-full max-w-xl animate-popup">
      {/* Circle + Cross */}
      <div className="flex items-center justify-center mb-6">

        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-pop">

          <div className="w-12 h-12 bg-[#AA3333] rounded-full flex items-center justify-center">

            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

          </div>
        </div>
      </div>

      {/* TEXT */}
      <h2 className="text-xl font-semibold text-gray-700">
        Action Failed
      </h2>

      <p className="text-gray-500 mt-2 text-sm">
        {errorMessage}
      </p>

    </div>
  </div>
)}


    </>
  );
};

export default Setting;