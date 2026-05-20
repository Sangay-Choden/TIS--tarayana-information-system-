

import { useState } from "react";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import Sidebar from "../../components/Sidebar";
// import Navbar from "../../components/Navbar";
import {
  Plus,
  Trash2,
  Pencil,
  Users,
  Shield,
  BadgeCheck,
  X,
} from "lucide-react";

const UserManagement = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

      const { pathname } = useLocation();
   const rootPath = pathname.split('/')[1];

  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("roles");

  const [users, setUsers] = useState([]);
const [showEditModal, setShowEditModal] = useState(false);
const [editItem, setEditItem] = useState(null);

const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;

const indexOfLast = currentPage * itemsPerPage;
const indexOfFirst = indexOfLast - itemsPerPage;
const currentUsers = users.slice(indexOfFirst, indexOfLast);

useEffect(() => {
  setCurrentPage(1);
}, [activeTab]);

  const [donors, setDonors] = useState([
    "ADB-Japan Fund for Poverty",
    "Alstom Foundation",
    "American Himalayan Foundation",
  ]);

  const [partners, setPartners] = useState([
    "MoH",
    "MoAF",
    "NEC",
  ]);

  const [deleteItem, setDeleteItem] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  const [showSuccess, setShowSuccess] = useState(false);
const [actionType, setActionType] = useState(null); 
// "add" | "edit"

  const [showroleModal, setShowroleModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
const [editRole, setEditRole] = useState(null);

const [editRoleName, setEditRoleName] = useState("");
const [editRoleDesc, setEditRoleDesc] = useState("");

   const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
const [successType, setSuccessType] = useState("");
  const [showroleSuccess, setShowroleSuccess] = useState(false);
  const [deleteroleItem, setDeleteroleItem] = useState(null);

  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
const [showErrorPopup, setShowErrorPopup] = useState(false);
const [errorMessage, setErrorMessage] = useState("");


const roleColors = {
  Admin: "bg-red-100 text-red-600",
  ProgrammeOfficer: "bg-blue-100 text-blue-600",
  FieldOfficer: "bg-green-100 text-green-600",
  "C&D Officer": "bg-purple-100 text-purple-600",
  "M&R Officer": "bg-yellow-100 text-yellow-600",
  Management: "bg-gray-200 text-gray-600",
};

const formatRoleName = (name) => {
  if (!name) return "";

  // Fix special roles FIRST
  if (name === "M&R Officer" || name === "M&ROfficer") return "M&R Officer";
  if (name === "C&D Officer" || name === "C&DOfficer") return "C&D Officer";

  // Normal case
  return name.replace(/([A-Z])/g, " $1").trim();
};


  useEffect(() => {
  fetchUsers();
  fetchDonorPartners();
}, []);

const fetchUsers = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/api/auth/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) return;

    setUsers(data.users); // 🔥 important (matches backend)
  } catch (err) {
    console.error(err);
  }
};
  const toggleActive = (id) => {
    setUsers(users.map((u) =>
      u.id === id ? { ...u, active: !u.active } : u
    ));
  };

  const fetchDonorPartners = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API_URL}/api/donor-partner/summary`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) return;

    // Extract only names
   setDonors(data.donors);
setPartners(data.partners);

  } catch (err) {
    console.error(err);
  }
};

 const confirmDelete = async () => {
  try {
    const token = localStorage.getItem("token");

    // USERS delete
    if (activeTab === "users") {
      const res = await fetch(
        `${API_URL}/api/auth/user/${deleteItem}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) return alert(data.message);

      setUsers(users.filter((u) => u._id !== deleteItem));
    }

    // DONOR/PARTNER delete
    else {
      const res = await fetch(
        `${API_URL}/api/donor-partner/delete/${deleteItem}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) return alert(data.message);

      // Refresh list
      fetchDonorPartners();
    }

    setDeleteItem(null);

    setShowDeleteSuccess(true);

setTimeout(() => {
  setShowDeleteSuccess(false);
}, 2000);

  } catch (err) {
    console.error(err);
  }
};

 const handleSave = async () => {
  if (!inputValue.trim()) return;

  // Only handle donors & partners here
  if (activeTab === "donors" || activeTab === "partners") {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/donor-partner/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: inputValue,
            roleName: activeTab === "donors" ? "Donor" : "Partner",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) return alert(data.message);

      // ✅ Update UI after success
      if (activeTab === "donors") {
       fetchDonorPartners();
      } else {
      fetchDonorPartners();
      }

       setActionType("add"); // ✅ ADD THIS


      setShowModal(false);
      setInputValue("");
      setEditIndex(null);

       setShowSuccess(true);

  setTimeout(() => {
    setShowSuccess(false);
    setActionType(null); // reset after popup
  }, 2000);

    } catch (err) {
      console.error(err);
    }
  }

  if (activeTab === "roles") {
  const res = await fetch(`${API_URL}/api/roles/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      roleName: inputValue,
    }),
  });

  const data = await res.json();
  if (!res.ok) return alert(data.message);

  fetchRoles();
}
  
};

const handleEdit = (item) => {
  setEditItem(item);
  setInputValue(item.name);
  setShowEditModal(true);
};

const handleEditRole = (role) => {
  setEditRole(role);

  setEditRoleName(role.roleName || "");
  setEditRoleDesc(role.roleDescription || "");

  setShowEditRoleModal(true);
};



const handleUpdate = async () => {
  if (!inputValue.trim()) return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API_URL}/api/donor-partner/update/${editItem._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: inputValue }),
      }
    );

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    // refresh list
    fetchDonorPartners();

    setActionType("edit");

    // reset
    setShowEditModal(false);
    setEditItem(null);
    setInputValue("");
     setShowSuccess(true);

  setTimeout(() => {
    setShowSuccess(false);
    setActionType(null); // reset after popup
  }, 2000);

  } catch (err) {
    console.error(err);
  }
};


const handleUpdateRole = async () => {
  if (!editRoleName.trim()) return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API_URL}/api/roles/update/${editRole._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roleName: editRoleName,
          roleDescription: editRoleDesc,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return alert(data.message);
    }

    fetchRoles();

    setShowEditRoleModal(false);
    setEditRole(null);

    setEditRoleName("");
    setEditRoleDesc("");

    setSuccessType("edit-role");
    setShowroleSuccess(true);

    setTimeout(() => {
      setShowroleSuccess(false);
    }, 2000);

  } catch (err) {
    console.error(err);
  }
};


const [roles, setRoles] = useState([]);

const fetchRoles = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/api/roles/list`, {
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
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/api/roles/create`, {
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

  setErrorMessage(data.message || "Failed to create role.");
  setShowErrorPopup(true);

  setTimeout(() => {
    setShowErrorPopup(false);
  }, 2000);

  return;
}

    // refresh roles from backend
    fetchRoles();

    setShowroleModal(false);
    setRoleName("");
    setRoleDesc("");

    setSuccessType("role");
    setShowroleSuccess(true);
    setTimeout(() => setShowroleSuccess(false), 2000);

  } catch (err) {
    console.error(err);
  }
};

const confirmDeleterole = async () => {
  try {
    const token = localStorage.getItem("token");

    const roleId = [deleteroleItem];

    const res = await fetch(
      `${API_URL}/api/roles/delete/${roleId}`,
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

    setDeleteroleItem(null);

    setShowDeleteSuccess(true);

setTimeout(() => {
  setShowDeleteSuccess(false);
}, 2000);

  } catch (err) {
    console.error(err);
  }
};

// const activeList =
//   activeTab === "users"
//     ? users
//     : activeTab === "donors"
//     ? donors
//     : partners;
const activeList =
  activeTab === "roles"
    ? roles
    : activeTab === "users"
    ? users
    : activeTab === "donors"
    ? donors
    : activeTab === "partners"
    ? partners
    : roles;

const currentList = activeList.slice(indexOfFirst, indexOfLast);


  return (
    <>
<div className="w-full px-2 sm:px-2 lg:px-2 pb-6 space-y-6 overflow-x-hidden">

  

      {/* Main */}
<div className="w-full ">
  <div className="space-y-6">

          {/* HEADER */}
          <div>
            {/* <h2 className="text-xl font-semibold">User Management</h2>
            <p className="text-sm text-gray-500">
              Roles & access control
            </p> */}
          </div>

          {/* KPI CARDS */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4"> 
  <div className="bg-blue-100 p-3 rounded-lg"> 
    <Shield className="text-blue-600" size={20} /> </div> 
    <div>
       {/* <p className="text-lg font-semibold">{roles?.filter((r) => r.roleName !== "Partner").length || 0}</p> */}
              <p className="text-lg font-semibold">{roles.length || 0}</p>

     <p className="text-sm text-gray-500">Total Roles</p>
      </div> </div>
 <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4"> 
  <div className="bg-blue-100 p-3 rounded-lg"> 
    <Users className="text-blue-600" size={20} /> </div> 
    <div> <p className="text-lg font-semibold">{users.length}</p>
     <p className="text-sm text-gray-500">Total Users</p>
      </div> </div>
       

  <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4"> 
  <div className="bg-green-100 p-3 rounded-lg"> 
    <Shield className="text-green-600" size={20} /> </div> 
    <div> <p className="text-lg font-semibold">{donors.length}</p>
     <p className="text-sm text-gray-500">Total Donors</p>
      </div> </div>
       <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4"> 
  <div className="bg-yellow-100 p-3 rounded-lg"> 
    <BadgeCheck className="text-yellow-600" size={20} /> </div> 
    <div> <p className="text-lg font-semibold">{partners.length}</p>
     <p className="text-sm text-gray-500">Total Partners</p>
      </div> </div>

</div>





          {/* TABS + BUTTON */}
          {/* <div className="flex justify-between items-center"> */}
<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

            {/* Tabs */}
            {/* <div className="flex bg-white p-1 rounded-xl shadow"> */}
            <div className="flex flex-wrap bg-white p-1 rounded-xl shadow w-full sm:w-auto">
              {/* {["users", "donors", "partners"].map((tab) => ( */}
              {["roles", "users", "donors", "partners"].map((tab) => (
                // <button
                //   key={tab}
                //   onClick={() => setActiveTab(tab)}
                //   className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm capitalize flex items-center justify-center gap-2 transition
                //     ${activeTab === tab
                //       ? "bg-[#2EA1F2] text-white shadow"
                //       : "text-gray-500"}
                //   `}
                // >
                //   {tab === "users" && <Users size={16} />}
                //   {tab === "donors" && <Shield size={16} />}
                //   {tab === "partners" && <BadgeCheck size={16} />}
                //  {tab === "roles" && <Shield size={16} />}
                // </button>

                <button
  key={tab}
  onClick={() => setActiveTab(tab)}
  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm capitalize flex items-center justify-center gap-2 transition
    ${activeTab === tab
      ? "bg-[#2EA1F2] text-white shadow"
      : "text-gray-500"}
  `}
>
  {tab === "roles" && <Shield size={16} />}
  {tab === "users" && <Users size={16} />}
  {tab === "donors" && <Shield size={16} />}
  {tab === "partners" && <BadgeCheck size={16} />}

  {/* ✅ ADD THIS LINE */}
  <span className="hidden sm:inline">
    {tab}
  </span>
</button>
              ))}
            </div>

            {/* BUTTON SWITCH */}
            {/* {activeTab === "users" ? (
              <button
               onClick={() => navigate("/add-user")}
className="w-full sm:w-auto bg-[#2EA1F2] text-white px-4 py-2 shadow font-bold text-md rounded-lg flex justify-center items-center gap-2 hover:bg-[#298CD2] transition-colors"
              >
                <Plus size={16} /> Add User
              </button>
            ) : (
              <button
                onClick={() => setShowModal(true)}
className="w-full sm:w-auto bg-[#2EA1F2] text-white px-4 py-2 text-sm shadow font-bold rounded-lg flex justify-center items-center gap-2 hover:bg-[#298CD2] transition-colors"
              >
                <Plus size={16} /> Add {activeTab.slice(0, -1)}
              </button>
            )} */}


            {activeTab === "users" ? (
  <button
    type="button"
    onClick={() => navigate("/admin/users/add-user")}   // ✅ FIX HERE
    className="w-full sm:w-auto bg-[#2EA1F2] text-white px-4 py-2 shadow font-bold text-sm rounded-lg flex justify-center items-center gap-2 hover:bg-[#298CD2]"
  >
    <Plus size={16} /> Add User
  </button>
) : activeTab === "roles" ? (
  <button
    onClick={() => setShowroleModal(true)}   // ✅ FIX HERE
    className="w-full sm:w-auto bg-[#2EA1F2] text-white px-4 py-2 text-sm shadow font-bold rounded-lg flex justify-center items-center gap-2 hover:bg-[#298CD2]"
  >
    <Plus size={16} /> Create Role
  </button>
) : (
  <button
    onClick={() => setShowModal(true)}
    className="w-full sm:w-auto bg-[#2EA1F2] text-white px-4 py-2 text-sm shadow font-bold rounded-lg flex justify-center items-center gap-2 hover:bg-[#298CD2]"
  >
    <Plus size={16} /> Add {activeTab.slice(0, -1)}
  </button>
)}
          </div>

          {/* USERS TABLE */}
          {activeTab === "users" && (
<div className="bg-white rounded-xl shadow overflow-hidden overflow-x-auto">
         <table className="w-full min-w-[500px] text-sm">
                <thead className="bg-gray-50 ext-sm font-bold text-gray-700 ">
                  <tr>
                    <th className="p-4 text-left">User</th>
                    <th className="p-4 text-left">Role</th>
                    <th className="p-4 text-left">Description</th>
                    {/* <th className="p-4 text-center">Active</th> */}
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
  {currentUsers.map((u) => (
    <tr key={u._id} className="border-t">
      
      <td className="p-4 flex gap-3">
        <div className="bg-blue-100 p-2 rounded-full">
          <Users size={16} className="text-blue-600" />
        </div>
        <div>
          <p className="font-medium">{u.email}</p>
          {/* <p className="text-xs text-gray-400">{u.email}</p> */}
        </div>
      </td>

      <td className="p-4 text-left">
        {/* <span className={`px-3 py-1 rounded-full text-xs ${roleColors[u.roleId?.roleName]}`}>
          {u.roleId?.roleName}
        </span> */}

<span
  className={`px-4 py-1 rounded-full text-xs font-medium text-left ${
    roleColors[u.roleId?.roleName] || "bg-gray-100 text-gray-500"
  }`}
>
  {/* {u.roleId?.roleName.replace(/([A-Z])/g, " $1").trim()} */}
  {formatRoleName(u.roleId?.roleName)}
</span>


      </td>

      <td className="p-4 text-left text-gray-500">
        {u.roleId?.roleDescription}
      </td>

      {/* <td className="p-4 text-center">
        <span className="text-green-500">Active</span>
      </td> */}

      <td className="p-4 text-center">
        <Trash2
          size={16}
          className="text-[#AA3333] cursor-pointer"
          onClick={() => setDeleteItem(u._id)}
        />
      </td>
    </tr>
  ))}
</tbody>



              </table>




{/* PAGINATION */}
{users.length > itemsPerPage && (
  <div className="flex flex-col items-left gap-2 ml-4 mt-4 mb-4">

    {/* TEXT */}
    <p className="text-xs sm:text-sm text-gray-500">
      {indexOfFirst + 1}–
      {Math.min(indexOfLast, users.length)} of {users.length}
    </p>

    {/* BUTTONS */}
    <div className="flex items-center gap-2">

      {/* PREV */}
      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 text-xs sm:text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition"
      >
        Prev
      </button>

      {/* CURRENT PAGE */}
      <span className="text-sm font-medium text-gray-700">
        {currentPage} / {Math.ceil(users.length / itemsPerPage)}
      </span>

      {/* NEXT */}
      <button
        onClick={() =>
          setCurrentPage((p) =>
            Math.min(
              p + 1,
              Math.ceil(users.length / itemsPerPage)
            )
          )
        }
        disabled={
          currentPage === Math.ceil(users.length / itemsPerPage)
        }
        className="px-3 py-1 text-xs sm:text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition"
      >
        Next
      </button>

    </div>
  </div>
)}

            </div>
          )}

      
{activeTab === "roles" && (
  <div className="bg-white rounded-xl shadow overflow-hidden overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="ext-sm font-bold text-gray-700 bg-gray-50">
        <tr>
          <th className="p-4 text-left">Role</th>
          <th className="p-4 text-left">Description</th>
          <th className="p-4 text-left">Actions</th>
        </tr>
      </thead>

      <tbody>
        {currentList.map((role) => (
          <tr key={role._id} className="border-t">
            <td className="p-4">
              <span className={`px-3 py-1 rounded-full text-xs ${
                roleColors[role.roleName] || "bg-gray-100"
              }`}>
                {formatRoleName(role.roleName)}
              </span>
            </td>

            <td className="p-4 text-gray-500">
              {role.roleDescription}
            </td>

            <td className="p-4 text-left flex gap-3">
               <Pencil
          size={16}
          className="cursor-pointer"
          onClick={() => handleEditRole(role)}
        />
              <Trash2
                size={16}
                className="text-[#AA3333] cursor-pointer"
                onClick={() => setDeleteroleItem(role._id)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>


{/* PAGINATION */}
{activeList.length > itemsPerPage && (
  <div className="flex flex-col items-left gap-2 ml-4 mt-4 mb-4">

    <p className="text-xs sm:text-sm text-gray-500">
      {indexOfFirst + 1}–
      {Math.min(indexOfLast, activeList.length)} of {activeList.length}
    </p>

    <div className="flex items-center gap-2">

      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 text-xs sm:text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-100"
      >
        Prev
      </button>

      <span className="text-sm font-medium text-gray-700">
        {currentPage} / {Math.ceil(activeList.length / itemsPerPage)}
      </span>

      <button
        onClick={() =>
          setCurrentPage((p) =>
            Math.min(
              p + 1,
              Math.ceil(activeList.length / itemsPerPage)
            )
          )
        }
        disabled={
          currentPage === Math.ceil(activeList.length / itemsPerPage)
        }
        className="px-3 py-1 text-xs sm:text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-100"
      >
        Next
      </button>

    </div>
  </div>
)}


  </div>
)}



          {/* DONORS & PARTNERS TABLE */}
          {(activeTab === "donors" || activeTab === "partners") && (
            <div className="bg-white rounded-xl shadow overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="ext-sm font-bold text-gray-700 bg-gray-50">
                  <tr>
                    <th className="p-4 text-left">Sl no.</th>
                    <th className="p-4 text-left">
                      {activeTab === "donors" ? "Donor Name" : "Partner Name"}
                    </th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
<tbody>
  {currentList.map((item, i) => (
    <tr key={item._id} className="border-t">
      {/* <td className="p-4">{i + 1}</td> */}
<td className="p-4">{indexOfFirst + i + 1}</td>

      <td className="p-4 ">{item.name}</td>

      <td className="p-4 text-center flex justify-center gap-3">
        <Pencil
          size={16}
          className="cursor-pointer"
          onClick={() => handleEdit(item)}
        />

        <Trash2
          size={16}
          className="text-[#AA3333] cursor-pointer"
          onClick={() => setDeleteItem(item._id)}
        />
      </td>
    </tr>
  ))}
</tbody>
              </table>


{/* PAGINATION */}
{activeList.length > itemsPerPage && (
  <div className="flex flex-col items-left gap-2 ml-4 mt-4 mb-4">

    <p className="text-xs sm:text-sm text-gray-500">
      {indexOfFirst + 1}–
      {Math.min(indexOfLast, activeList.length)} of {activeList.length}
    </p>

    <div className="flex items-center gap-2">

      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 text-xs sm:text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-100"
      >
        Prev
      </button>

      <span className="text-sm font-medium text-gray-700">
        {currentPage} / {Math.ceil(activeList.length / itemsPerPage)}
      </span>

      <button
        onClick={() =>
          setCurrentPage((p) =>
            Math.min(
              p + 1,
              Math.ceil(activeList.length / itemsPerPage)
            )
          )
        }
        disabled={
          currentPage === Math.ceil(activeList.length / itemsPerPage)
        }
        className="px-3 py-1 text-xs sm:text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-100"
      >
        Next
      </button>

    </div>
  </div>
)}


            </div>
          )}
        </div>
      </div>

</div>

      {/* ADD MODAL */}
   {showModal && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100]">
    <div className="bg-white rounded-xl p-6 w-full max-w-xl">

      <div className="flex justify-between mb-4">
        <h2 className="font-bold">
          Add {activeTab.slice(0, -1)}
        </h2>
        <X onClick={() => setShowModal(false)} className="cursor-pointer" />
      </div>

      {/* ONLY CHANGE: wrap with form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave(); // 👈 same logic, unchanged
        }}
      >

        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg mb-4"
          placeholder="Enter name"
          required   // ✅ now works
        />

        <div className="flex justify-end gap-3">

          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="border px-4 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"   // ✅ important change
            className="bg-[#2EA1F2] text-white px-5 py-2 shadow font-bold text-md rounded-lg flex items-center gap-2 hover:bg-[#298CD2] transition-color"
          >
            Add
          </button>

        </div>

      </form>
    </div>
  </div>
)}
      
{showEditModal && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100]">
    <div className="bg-white rounded-xl p-6 w-full max-w-xl">

      <div className="flex justify-between mb-4">
        <h2 className="font-bold">Edit {activeTab.slice(0, -1)}</h2>
        <X
          onClick={() => {
            setShowEditModal(false);
            setEditItem(null);
          }}
          className="cursor-pointer"
        />
      </div>

      {/* ONLY CHANGE: wrap in form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate(); // 👈 same logic, unchanged
        }}
      >

        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg mb-4"
          required   // ✅ now validation works
        />

        <div className="flex justify-end gap-3">

          <button
            type="button"
            onClick={() => {
              setShowEditModal(false);
              setEditItem(null);
            }}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
            type="submit"   // ✅ important
            className="bg-[#2EA1F2] text-white px-5 py-2 shadow font-bold text-md rounded-lg flex items-center gap-2 hover:bg-[#298CD2] transition-color"
          >
            Update
          </button>

        </div>

      </form>

    </div>
  </div>
)}

      {/* DELETE MODAL */}
      {deleteItem !== null && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100]">
          <div className="bg-white rounded-xl p-6 w-full max-w-xl shadow">
            <h2 className="text-lg font-semibold mb-2">Delete Item?</h2>
            <p className="text-gray-500 text-sm mb-6">
             Are you sure you want to delete this item? This action is permanent and cannot be undone. Once deleted, this will be permanently removed along with all related data and permissions.
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



      
      {/* SUCCESS POPUP */}
{showSuccess && (
  <div className="fixed inset-0 flex items-center justify-center z-[100]">
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

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

      <h2 className="text-lg font-semibold text-gray-700">
       {actionType === "edit" ? "Updated Successfully" : "Added Successfully"}
      </h2>

     <p className="text-gray-500 mt-2 text-sm">
  {activeTab === "donors"
    ? actionType === "edit"
      ? "Donor updated successfully."
      : "Donor added successfully."
    : actionType === "edit"
    ? "Partner updated successfully."
    : "Partner added successfully."}
</p>
    </div>
  </div>
)}






    {/* CREATE ROLE MODAL */}
     {showroleModal && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100]">
    <div className="bg-white rounded-xl p-6 w-full max-w-2xl">

      <div className="flex justify-between">
        <h2 className="font-bold text-lg">Create New Role</h2>
        <X onClick={() => setShowroleModal(false)} className="cursor-pointer" />
      </div>

      <p className="text-sm mb-6 text-gray-400">
        Define a custom role with specific module access permissions.
      </p>

      {/* ✅ FORM WRAPPER (THIS IS THE KEY) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateRole();
        }}
      >
        <input
          placeholder="Role Name"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg mb-4"
          required
        />

        <textarea
          placeholder="Role Description"
          value={roleDesc}
          onChange={(e) => setRoleDesc(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg mb-4"
          required
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowroleModal(false)}
            className="border px-4 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-[#2EA1F2] text-white px-5 py-2 shadow font-bold text-md rounded-lg hover:bg-[#298CD2]"
          >
            Create Role
          </button>
        </div>
      </form>
    </div>
  </div>
)}


     {showEditRoleModal && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100]">

    <div className="bg-white rounded-xl p-6 w-full max-w-2xl">

      <div className="flex justify-between">
        <h2 className="font-bold text-lg">
          Edit Role
        </h2>

        <X
          onClick={() => {
            setShowEditRoleModal(false);
            setEditRole(null);
          }}
          className="cursor-pointer"
        />
      </div>

      <p className="text-sm text-gray-400 mb-6">
        Update role information and permissions.
      </p>

      {/* FORM WRAP */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdateRole(); // 👈 same logic, unchanged
        }}
      >

        <input
          placeholder="Role Name"
          value={editRoleName}
          onChange={(e) => setEditRoleName(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg mb-4"
          required   // ✅ now enforced
        />

        <textarea
          placeholder="Role Description"
          value={editRoleDesc}
          onChange={(e) => setEditRoleDesc(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg mb-4"
          required   // ✅ now enforced
        />

        <div className="flex justify-end gap-3">

          <button
            type="button"
            onClick={() => {
              setShowEditRoleModal(false);
              setEditRole(null);
            }}
            className="border px-4 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-[#2EA1F2] text-white px-5 py-2 shadow font-bold text-md rounded-lg hover:bg-[#298CD2]"
          >
            Update Role
          </button>

        </div>

      </form>

    </div>
  </div>
)}


     {showroleSuccess && (
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
        {successType === "role" || successType === "edit-role"
          ? successType === "edit-role"
  ? "Role Updated Successfully"
  : "Role Created Successfully"
          : "Banner Updated Successfully"}
      </h2>

      <p className="text-gray-500 mt-2 text-sm">
        {successType === "role" || successType === "edit-role"
          ? "The new role has been created and is now available to assign to users."
          : "The banner has been updated and the latest changes are now visible."}
      </p>
    </div>
  </div>
)}

{deleteroleItem !== null && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100]">
    <div className="bg-white rounded-xl p-6 w-full max-w-xl shadow">
      <h2 className="text-lg font-semibold mb-2">Delete Role?</h2>
      <p className="text-gray-500 text-sm mb-6">
        Are you sure you want to delete this role? This action cannot be undone. Once deleted, this role will be permanently removed along with all related data and permissions.
      </p>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => setDeleteroleItem(null)}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={confirmDeleterole}
          className="px-4 py-2 bg-[#AA3333] text-white rounded-lg"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}


{showDeleteSuccess && (
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
        Deleted Successfully
      </h2>

      <p className="text-gray-500 mt-2 text-sm">
        The item has been deleted successfully.
      </p>

    </div>
  </div>
)}

{showErrorPopup && (
  <div className="fixed inset-0 flex items-center justify-center z-[100]">

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

    {/* Card */}
    <div className="relative bg-white rounded-xl shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-center w-full max-w-xl animate-popup">

      {/* Error Icon */}
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

export default UserManagement;