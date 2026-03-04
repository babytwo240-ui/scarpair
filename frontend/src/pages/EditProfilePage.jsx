import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import DeleteAccountModal from '../components/DeleteAccountModal';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    businessName: '',
    companyName: '',
    specialization: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.getProfile();
      const profileData = response.user || response.data;

      setFormData({
        email: profileData.email || '',
        phone: profileData.phone || '',
        businessName: profileData.businessName || '',
        companyName: profileData.companyName || '',
        specialization: profileData.specialization || '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Prepare update data based on user type
      const updateData = {
        phone: formData.phone,
      };

      if (user?.type === 'business') {
        updateData.businessName = formData.businessName;
      } else if (user?.type === 'recycler') {
        updateData.companyName = formData.companyName;
        updateData.specialization = formData.specialization;
      }

      await userService.updateProfile(updateData);
      setSuccess('Profile updated successfully!');

      setTimeout(() => {
        if (user?.type === 'business') {
          navigate('/business/dashboard');
        } else {
          navigate('/recycler/dashboard');
        }
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user?.type === 'business') {
      navigate('/business/dashboard');
    } else {
      navigate('/recycler/dashboard');
    }
  };

  const handleDeleteAccountSuccess = () => {
    setShowDeleteModal(false);
    logout();
    navigate('/');
  };

  const handlePasswordFieldChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setChangingPassword(true);

    try {
      await userService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => {
        setShowChangePassword(false);
      }, 1500);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px 20px', textAlign: 'center' }}>Loading profile...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Please login to edit your profile.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        â† Back
      </button>

      <h2>Edit Profile</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        {user.type === 'business' ? 'Business Profile' : 'Recycler Profile'}
      </p>

      {error && (
        <div
          style={{
            backgroundColor: '#fee',
            padding: '12px',
            borderRadius: '4px',
            color: '#c33',
            marginBottom: '20px',
            border: '1px solid #fcc',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            backgroundColor: '#efe',
            padding: '12px',
            borderRadius: '4px',
            color: '#3c3',
            marginBottom: '20px',
            border: '1px solid #cfc',
          }}
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
        {/* Email - Read Only */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            disabled
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f5f5f5',
              cursor: 'not-allowed',
              boxSizing: 'border-box',
            }}
          />
          <small style={{ color: '#999' }}>Email cannot be changed</small>
        </div>

        {/* Phone */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="e.g., +1234567890"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Business Name (Business Only) */}
        {user.type === 'business' && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Business Name *
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required
              placeholder="Your business name"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        {/* Company Name (Recycler Only) */}
        {user.type === 'recycler' && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Company Name *
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              placeholder="Your company name"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        {/* Specialization (Recycler Only) */}
        {user.type === 'recycler' && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Specialization
            </label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              placeholder="e.g., Plastic, Metal, Electronics"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
            <small style={{ color: '#999' }}>What materials do you specialize in?</small>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              padding: '12px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
        <h3>Password Management</h3>
        {!showChangePassword ? (
          <button
            type="button"
            onClick={() => setShowChangePassword(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            ðŸ” Change Password
          </button>
        ) : (
          <form onSubmit={handleChangePassword} style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
            {passwordError && (
              <div
                style={{
                  backgroundColor: '#fee',
                  padding: '12px',
                  borderRadius: '4px',
                  color: '#c33',
                  border: '1px solid #fcc',
                }}
              >
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div
                style={{
                  backgroundColor: '#efe',
                  padding: '12px',
                  borderRadius: '4px',
                  color: '#3c3',
                  border: '1px solid #cfc',
                }}
              >
                {passwordSuccess}
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Current Password *
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordFieldChange}
                required
                placeholder="Enter your current password"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                New Password *
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordFieldChange}
                required
                placeholder="Enter new password (minimum 8 characters)"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
              <small style={{ color: '#999' }}>
                Password must be at least 8 characters with uppercase, lowercase, and numbers
              </small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Confirm New Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordFieldChange}
                required
                placeholder="Confirm your new password"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                  setPasswordError('');
                }}
                style={{
                  padding: '12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={changingPassword}
                style={{
                  padding: '12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: changingPassword ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  opacity: changingPassword ? 0.7 : 1,
                }}
              >
                {changingPassword ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
        <h3>Account Actions</h3>
        <button
          onClick={() => setShowDeleteModal(true)}
          style={{
            padding: '12px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ðŸ—‘ï¸ Delete Account
        </button>
      </div>

      <DeleteAccountModal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        onSuccess={handleDeleteAccountSuccess}
      />
    </div>
  );
};

export default EditProfilePage;

