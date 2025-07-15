import React, { useState } from 'react';
import userAPI from '../../services/userAPI';
import { useNotification } from '../../contexts/NotificationContext';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'accountant', label: 'Accountant' },
];

function generateRandomPassword(name) {
  const prefix = (name.replace(/\s+/g, '').slice(0, 3) || 'usr').toLowerCase();
  const gibberish = Math.random().toString(36).slice(2, 8);
  return prefix + gibberish;
}

const AddUserModal = ({ isOpen, onClose, onSuccess, editUser }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    userId: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { addNotification } = useNotification();

  React.useEffect(() => {
    if (editUser) {
      setForm({
        name: editUser.name || '',
        email: editUser.email || '',
        role: editUser.role || '',
        userId: editUser.userId || '',
        phone: editUser.phone || '',
        password: '', // Don't prefill password
      });
    } else {
      setForm({ name: '', email: '', role: '', userId: '', phone: '', password: '' });
    }
    setError('');
  }, [editUser, isOpen]);

  // Auto-fill userId from email
  const handleInput = (e) => {
    const { name, value } = e.target;
    let updated = { ...form, [name]: value };
    if (name === 'email') {
      const id = value.split('@')[0] || '';
      updated.userId = id;
    }
    setForm(updated);
    setError('');
  };

  const handleGeneratePassword = () => {
    setForm((prev) => ({
      ...prev,
      password: generateRandomPassword(prev.name),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.phone || !form.role || !form.userId || (!editUser && !form.password)) {
      setError('All fields are required');
      return;
    }
    try {
      if (editUser) {
        await userAPI.updateUser(editUser._id, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          userId: form.userId,
        });
        addNotification('User updated successfully', 'success');
      } else {
        await userAPI.createUser({
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          userId: form.userId,
          password: form.password,
        });
        addNotification('User added successfully', 'success');
      }
      onSuccess && onSuccess();
      onClose && onClose();
      setForm({ name: '', email: '', phone: '', role: '', userId: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 className="text-xl font-bold mb-4">{editUser ? 'Edit User' : 'Add User'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleInput}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleInput}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleInput}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleInput}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Select Role</option>
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <input
              type="text"
              name="userId"
              value={form.userId}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="password"
                value={form.password}
                onChange={handleInput}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
                title="Generate Password"
              >
                Generate
              </button>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-semibold"
          >
            {editUser ? 'Save Changes' : 'Add User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal; 