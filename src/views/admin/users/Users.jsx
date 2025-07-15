import React, { useState, useEffect } from 'react';
import userAPI from '../../../services/userAPI';
import { useNotification } from '../../../contexts/NotificationContext';
import AddUserModal from '../../../components/common/AddUserModal';
import ConfirmationModal from '../../../components/common/Modal/ConfirmationModal';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'student', label: 'Student' },
  { value: 'superadmin', label: 'Super Admin' },
];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAllUsers();
      setUsers(res.data.data || []);
    } catch (err) {
      addNotification('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setShowModal(true);
  };

  const handleResetPassword = (user) => {
    setResetUser(user);
    setShowResetModal(true);
  };

  const confirmResetPassword = async () => {
    try {
      await userAPI.resetPassword(resetUser._id);
      addNotification('Password reset successfully', 'success');
    } catch (err) {
      addNotification('Failed to reset password', 'error');
    } finally {
      setShowResetModal(false);
      setResetUser(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <button
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center"
          onClick={() => { setEditUser(null); setShowModal(true); }}
        >
          <span className="material-symbols-outlined mr-2">person_add</span>
          Add User
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No users found.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{user.name || user.firstName + ' ' + (user.lastName || '')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.phone || user.phoneNumber || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.userId || user._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-900 mr-2" title="Edit" onClick={() => handleEdit(user)}>
                      ✏️
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900" title="Reset Password" onClick={() => handleResetPassword(user)}>
                      🔑
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <AddUserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchUsers}
        editUser={editUser}
      />
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={confirmResetPassword}
        title="Reset Password"
        message={`Are you sure you want to reset the password for ${resetUser?.name || resetUser?.email}?`}
      />
    </div>
  );
};

export default Users; 