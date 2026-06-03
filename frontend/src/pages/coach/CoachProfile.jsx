import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, Camera, Plus, Trash2, TrendingUp, Calendar, Ruler, Weight, X, Edit2, Check, 
  Activity, Award, Flame, Zap, Target, Briefcase, Star, Users, Clock, Mail, Phone, 
  MapPin, Linkedin, Instagram, Facebook, Twitter, Save, AlertCircle, Globe
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const CoachProfile = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    bio: user?.bio || '',
    specialty: user?.specialty || '',
    certifications: user?.certifications || '',
    experience: user?.experience || '',
    clientCount: user?.clientCount || '',
    successRate: user?.successRate || '',
    phone: user?.phone || '',
    location: user?.location || '',
    linkedin: user?.linkedin || '',
    instagram: user?.instagram || '',
    facebook: user?.facebook || '',
    twitter: user?.twitter || '',
  });

  // Fetch coach's clients count
  const { data: clients } = useQuery({
    queryKey: ['coachUsers'],
    queryFn: async () => {
      const response = await api.get('/coaches/users');
      return response.data.data.users;
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.patch('/users/profile', data);
      return response.data.data.user;
    },
    onSuccess: (userData) => {
      updateUser(userData);
      toast.success('Profile updated successfully');
      setEditingSection(null);
      queryClient.invalidateQueries(['coachProfile']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await api.post('/users/upload-profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data.user;
    },
    onSuccess: (userData) => {
      updateUser(userData);
      toast.success('Photo updated');
      setUploading(false);
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/users/profile-picture');
      return response.data.data.user;
    },
    onSuccess: (userData) => {
      updateUser(userData);
      toast.success('Photo removed');
    },
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    const formData = new FormData();
    formData.append('profilePicture', file);
    setUploading(true);
    uploadPhotoMutation.mutate(formData);
  };

  const handleSave = (field, value) => {
    updateProfileMutation.mutate({ [field]: value });
  };

  const formatDate = (date) => {
    if (!date) return null;
    try {
      return format(new Date(date), 'MMMM yyyy');
    } catch {
      return null;
    }
  };

  // Stats for display
  const displayStats = [
    { label: 'Total Clients', value: clients?.length || 0, icon: Users, color: 'blue' },
    { label: 'Active Plans', value: clients?.filter(c => c.dietPlan)?.length || 0, icon: Target, color: 'green' },
  ];

  if (profileData.experience) {
    displayStats.push({ label: 'Years Experience', value: profileData.experience, icon: Award, color: 'purple' });
  }
  if (profileData.successRate) {
    displayStats.push({ label: 'Success Rate', value: profileData.successRate, icon: TrendingUp, color: 'orange' });
  }

  const specialties = profileData.specialty ? profileData.specialty.split(',').map(s => s.trim()) : [];
  const certifications = profileData.certifications ? profileData.certifications.split(',').map(c => c.trim()) : [];

  return (
    <div className="space-y-6">
      {/* Hero Profile Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative px-6 py-8 flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm p-1 shadow-2xl ring-4 ring-white/20">
              <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-1 right-1 p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-50 transition"
            >
              {uploading ? <LoadingSpinner size="sm" /> : <Camera className="h-3 w-3 text-gray-600" />}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
          </div>
          
          {/* Info */}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{user?.name}</h1>
            <p className="text-blue-100 text-sm mt-1">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                Certified Coach
              </span>
              {user?.createdAt && (
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                  Since {formatDate(user.createdAt)}
                </span>
              )}
            </div>
          </div>
          
          {/* Remove Photo */}
          {user?.profilePicture && (
            <button
              onClick={() => deletePhotoMutation.mutate()}
              className="text-white/60 hover:text-white/90 transition text-sm"
            >
              <Trash2 className="h-4 w-4 inline mr-1" /> Remove
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${stat.color}-50 rounded-xl`}>
                  <Icon className={`h-5 w-5 text-${stat.color}-500`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Professional Bio Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-gray-800">Professional Bio</h3>
            </div>
            {editingSection !== 'bio' ? (
              <button onClick={() => setEditingSection('bio')} className="text-gray-400 hover:text-blue-500">
                <Edit2 className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={() => setEditingSection(null)} className="text-gray-400 hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {editingSection === 'bio' ? (
            <div className="space-y-3">
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Tell your clients about yourself, your coaching philosophy, and approach..."
              />
              <div className="flex gap-2">
                <button onClick={() => handleSave('bio', profileData.bio)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">
                  <Save className="h-3 w-3 inline mr-1" /> Save
                </button>
                <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-sm leading-relaxed">
              {profileData.bio || 'No bio added yet. Click edit to add your professional information.'}
            </p>
          )}
        </div>

        {/* Specialties Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-800">Specialties</h3>
            </div>
            {editingSection !== 'specialty' ? (
              <button onClick={() => setEditingSection('specialty')} className="text-gray-400 hover:text-blue-500">
                <Edit2 className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={() => setEditingSection(null)} className="text-gray-400 hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {editingSection === 'specialty' ? (
            <div className="space-y-3">
              <input
                type="text"
                value={profileData.specialty}
                onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Weight Loss, Strength Training, Nutrition, etc. (comma separated)"
              />
              <p className="text-xs text-gray-400">Separate multiple specialties with commas</p>
              <div className="flex gap-2">
                <button onClick={() => handleSave('specialty', profileData.specialty)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">
                  <Save className="h-3 w-3 inline mr-1" /> Save
                </button>
                <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {specialties.length > 0 ? (
                specialties.map((s, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                    {s}
                  </span>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No specialties added yet</p>
              )}
            </div>
          )}
        </div>

        {/* Certifications Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-gray-800">Certifications</h3>
            </div>
            {editingSection !== 'certifications' ? (
              <button onClick={() => setEditingSection('certifications')} className="text-gray-400 hover:text-blue-500">
                <Edit2 className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={() => setEditingSection(null)} className="text-gray-400 hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {editingSection === 'certifications' ? (
            <div className="space-y-3">
              <textarea
                value={profileData.certifications}
                onChange={(e) => setProfileData({ ...profileData, certifications: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Certified Personal Trainer (CPT), Nutrition Specialist, etc. (one per line or comma separated)"
              />
              <p className="text-xs text-gray-400">Separate multiple certifications with commas</p>
              <div className="flex gap-2">
                <button onClick={() => handleSave('certifications', profileData.certifications)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">
                  <Save className="h-3 w-3 inline mr-1" /> Save
                </button>
                <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {certifications.length > 0 ? (
                certifications.map((cert, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700 text-sm">{cert}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No certifications added yet</p>
              )}
            </div>
          )}
        </div>

        {/* Experience & Stats Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold text-gray-800">Experience & Stats</h3>
          </div>
          <div className="space-y-4">
            {/* Years Experience */}
            <div>
              <label className="text-sm text-gray-600 block mb-1">Years of Experience</label>
              {editingSection === 'experience' ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={profileData.experience}
                    onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="e.g., 5+ years"
                  />
                  <button onClick={() => handleSave('experience', profileData.experience)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">
                    <Save className="h-3 w-3" />
                  </button>
                  <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border rounded-lg text-sm">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-gray-800">{profileData.experience || 'Not set'}</p>
                  <button onClick={() => setEditingSection('experience')} className="text-gray-400 hover:text-blue-500">
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Success Rate */}
            <div>
              <label className="text-sm text-gray-600 block mb-1">Success Rate</label>
              {editingSection === 'successRate' ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={profileData.successRate}
                    onChange={(e) => setProfileData({ ...profileData, successRate: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="e.g., 94%"
                  />
                  <button onClick={() => handleSave('successRate', profileData.successRate)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">
                    <Save className="h-3 w-3" />
                  </button>
                  <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border rounded-lg text-sm">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-gray-800">{profileData.successRate || 'Not set'}</p>
                  <button onClick={() => setEditingSection('successRate')} className="text-gray-400 hover:text-blue-500">
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-800">Contact Information</h3>
          </div>
          <div className="space-y-3">
            {/* Phone */}
            <div>
              <label className="text-sm text-gray-600 block mb-1">Phone Number</label>
              {editingSection === 'phone' ? (
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="+1 234 567 8900"
                  />
                  <button onClick={() => handleSave('phone', profileData.phone)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">
                    <Save className="h-3 w-3" />
                  </button>
                  <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border rounded-lg text-sm">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-gray-800">{profileData.phone || 'Not set'}</p>
                  <button onClick={() => setEditingSection('phone')} className="text-gray-400 hover:text-blue-500">
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="text-sm text-gray-600 block mb-1">Location</label>
              {editingSection === 'location' ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="City, Country or Online"
                  />
                  <button onClick={() => handleSave('location', profileData.location)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">
                    <Save className="h-3 w-3" />
                  </button>
                  <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border rounded-lg text-sm">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-gray-800">{profileData.location || 'Not set'}</p>
                  <button onClick={() => setEditingSection('location')} className="text-gray-400 hover:text-blue-500">
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-800">Social Links</h3>
          </div>
          <div className="space-y-3">
            {/* LinkedIn */}
            <div>
              <label className="text-sm text-gray-600 block mb-1">LinkedIn</label>
              {editingSection === 'linkedin' ? (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={profileData.linkedin}
                    onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="https://linkedin.com/in/username"
                  />
                  <button onClick={() => handleSave('linkedin', profileData.linkedin)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">
                    <Save className="h-3 w-3" />
                  </button>
                  <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border rounded-lg text-sm">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-gray-800 text-sm truncate">{profileData.linkedin || 'Not set'}</p>
                  <button onClick={() => setEditingSection('linkedin')} className="text-gray-400 hover:text-blue-500">
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Instagram */}
            <div>
              <label className="text-sm text-gray-600 block mb-1">Instagram</label>
              {editingSection === 'instagram' ? (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={profileData.instagram}
                    onChange={(e) => setProfileData({ ...profileData, instagram: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="https://instagram.com/username"
                  />
                  <button onClick={() => handleSave('instagram', profileData.instagram)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">
                    <Save className="h-3 w-3" />
                  </button>
                  <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border rounded-lg text-sm">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-gray-800 text-sm truncate">{profileData.instagram || 'Not set'}</p>
                  <button onClick={() => setEditingSection('instagram')} className="text-gray-400 hover:text-blue-500">
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Facebook */}
            <div>
              <label className="text-sm text-gray-600 block mb-1">Facebook</label>
              {editingSection === 'facebook' ? (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={profileData.facebook}
                    onChange={(e) => setProfileData({ ...profileData, facebook: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="https://facebook.com/username"
                  />
                  <button onClick={() => handleSave('facebook', profileData.facebook)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">
                    <Save className="h-3 w-3" />
                  </button>
                  <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border rounded-lg text-sm">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-gray-800 text-sm truncate">{profileData.facebook || 'Not set'}</p>
                  <button onClick={() => setEditingSection('facebook')} className="text-gray-400 hover:text-blue-500">
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Twitter/X */}
            <div>
              <label className="text-sm text-gray-600 block mb-1">Twitter/X</label>
              {editingSection === 'twitter' ? (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={profileData.twitter}
                    onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="https://twitter.com/username"
                  />
                  <button onClick={() => handleSave('twitter', profileData.twitter)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">
                    <Save className="h-3 w-3" />
                  </button>
                  <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 border rounded-lg text-sm">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-gray-800 text-sm truncate">{profileData.twitter || 'Not set'}</p>
                  <button onClick={() => setEditingSection('twitter')} className="text-gray-400 hover:text-blue-500">
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tip Box */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 text-sm">Profile Tips</h4>
            <p className="text-xs text-blue-600 mt-1">
              Complete your profile to help clients learn about your expertise. 
              Add your bio, specialties, and contact information to build trust with potential clients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachProfile;