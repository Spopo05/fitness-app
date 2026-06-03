import { useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Save, 
  Trash2, 
  CreditCard,
  Bell,
  Shield,
  LogOut,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Upload
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useNavigate } from 'react-router-dom'

const Settings = () => {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)
  
  const [activeTab, setActiveTab] = useState('profile')
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  
  // Password change state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })
  const [profileErrors, setProfileErrors] = useState({})
  
  // Upload profile picture mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await api.post('/users/upload-profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data.data.user
    },
    onSuccess: (userData) => {
      updateUser(userData)
      queryClient.invalidateQueries(['userProfile'])
      toast.success('Profile picture updated successfully!')
      setUploading(false)
      setPreviewImage(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload picture')
      setUploading(false)
      setPreviewImage(null)
    }
  })
  
  // Delete profile picture mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/users/profile-picture')
      return response.data.data.user
    },
    onSuccess: (userData) => {
      updateUser(userData)
      queryClient.invalidateQueries(['userProfile'])
      toast.success('Profile picture removed successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete picture')
    }
  })
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.patch('/users/profile', data)
      return response.data.data.user
    },
    onSuccess: (userData) => {
      updateUser(userData)
      toast.success('Profile updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    }
  })
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/users/change-password', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setPasswordErrors({})
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password')
    }
  })
  
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image (JPEG, PNG, GIF, or WEBP)')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result)
    }
    reader.readAsDataURL(file)
    
    const formData = new FormData()
    formData.append('profilePicture', file)
    setUploading(true)
    uploadPhotoMutation.mutate(formData)
  }
  
  const handleRemovePhoto = () => {
    if (confirm('Are you sure you want to remove your profile picture?')) {
      deletePhotoMutation.mutate()
    }
  }
  
  const handleProfileSubmit = (e) => {
    e.preventDefault()
    const errors = {}
    if (!profileData.name.trim()) errors.name = 'Name is required'
    if (!profileData.email.trim()) errors.email = 'Email is required'
    if (profileData.email && !/^\S+@\S+$/i.test(profileData.email)) {
      errors.email = 'Invalid email address'
    }
    
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors)
      return
    }
    
    updateProfileMutation.mutate(profileData)
  }
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    const errors = {}
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required'
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters'
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }
    
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    })
  }
  
  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'password', name: 'Password', icon: Lock },
    { id: 'subscription', name: 'Subscription', icon: CreditCard },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ]
  
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences.</p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-20">
            {/* Profile Summary */}
            <div className="p-4 border-b border-gray-200 text-center">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-blue-600 mx-auto">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : user?.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50"
                >
                  <Camera className="h-3 w-3 text-gray-600" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="hidden"
                />
              </div>
              <h3 className="font-semibold text-gray-900 mt-2">{user?.name}</h3>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            
            {/* Tabs */}
            <div className="p-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                  </button>
                )
              })}
            </div>
            
            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => logout()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
              
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
                  {profileErrors.name && (
                    <p className="mt-1 text-xs text-red-600">{profileErrors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                  {profileErrors.email && (
                    <p className="mt-1 text-xs text-red-600">{profileErrors.email}</p>
                  )}
                </div>
                
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {updateProfileMutation.isPending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
              
              {/* Profile Picture Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-blue-600">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="h-3 w-3 inline mr-1" />
                      Change
                    </button>
                    {user?.profilePicture && (
                      <button
                        onClick={handleRemovePhoto}
                        className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3 w-3 inline mr-1" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG, GIF up to 5MB</p>
              </div>
            </div>
          )}
          
          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-xs text-red-600">{passwordErrors.currentPassword}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-xs text-red-600">{passwordErrors.newPassword}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
                
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {changePasswordMutation.isPending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscription Plan</h2>
              
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">Manage your subscription</p>
                <button
                  onClick={() => navigate('/subscription')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View Subscription Plans
                </button>
              </div>
            </div>
          )}
          
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive updates about your workouts and diet plans</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-500">Get real-time updates on your mobile device</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Message Alerts</p>
                    <p className="text-sm text-gray-500">Get notified when you receive a new message</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="mt-6 pt-4 flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings