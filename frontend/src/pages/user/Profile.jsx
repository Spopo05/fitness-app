import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { User, Camera, Plus, Trash2, TrendingUp, Calendar, Ruler, Weight, X, Edit2, Check, Activity } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [weightValue, setWeightValue] = useState('');
  const [heightValue, setHeightValue] = useState(user?.height || '');
  const [isEditingHeight, setIsEditingHeight] = useState(false);

  const isRTL = i18n.language === 'ar';

  // Fetch weight history - sorted oldest to newest for chart
  const { data: weightHistory, isLoading: weightLoading } = useQuery({
    queryKey: ['weightHistory'],
    queryFn: async () => {
      const response = await api.get('/users/weight');
      return response.data.data.weightHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
  });

  // Update height mutation
  const updateHeightMutation = useMutation({
    mutationFn: async (height) => {
      const response = await api.patch('/users/profile', { height });
      return response.data.data.user;
    },
    onSuccess: (userData) => {
      updateUser(userData);
      toast.success(t('profile.heightUpdated'));
      setIsEditingHeight(false);
    },
  });

  // Add weight mutation
  const addWeightMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/users/weight', data);
      return response.data.data.weightHistory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['weightHistory']);
      setWeightValue('');
      setShowWeightForm(false);
      toast.success(t('profile.weightAdded'));
    },
  });

  // Upload profile picture mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await api.post('/users/upload-profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data.user;
    },
    onSuccess: (userData) => {
      updateUser(userData);
      toast.success(t('profile.photoUpdated'));
      setUploading(false);
      setPreviewImage(null);
    },
  });

  // Delete profile picture mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/users/profile-picture');
      return response.data.data.user;
    },
    onSuccess: (userData) => {
      updateUser(userData);
      toast.success(t('profile.photoRemoved'));
    },
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t('profile.invalidImage'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.imageTooLarge'));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('profilePicture', file);
    setUploading(true);
    uploadPhotoMutation.mutate(formData);
  };

  const handleRemovePhoto = () => {
    if (confirm(t('profile.confirmRemovePhoto'))) {
      deletePhotoMutation.mutate();
    }
  };

  const handleAddWeight = () => {
    if (!weightValue) {
      toast.error(t('profile.enterWeight'));
      return;
    }
    addWeightMutation.mutate({
      weight: parseFloat(weightValue),
      date: new Date().toISOString(),
    });
  };

  const handleUpdateHeight = () => {
    if (!heightValue) {
      toast.error(t('profile.enterHeight'));
      return;
    }
    updateHeightMutation.mutate(parseFloat(heightValue));
  };

  const formatWeightData = (data) => {
    return data?.slice(-7).map(entry => ({
      date: format(new Date(entry.date), 'MM/dd'),
      weight: entry.weight
    })) || [];
  };

  const latestWeight = weightHistory?.[weightHistory.length - 1]?.weight;
  const firstWeight = weightHistory?.[0]?.weight;
  const weightChange = latestWeight && firstWeight ? (latestWeight - firstWeight).toFixed(1) : null;
  const isWeightDown = weightChange && weightChange < 0;
  const totalEntries = weightHistory?.length || 0;

  if (weightLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('profile.title')}</h1>
        <p className="text-gray-600 mt-2">{t('profile.subtitle')}</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cover Image Area */}
        <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600"></div>
        
        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="relative -mt-12 inline-block">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-blue-600">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                ) : user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Camera Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {uploading ? <LoadingSpinner size="sm" /> : <Camera className="h-3 w-3 text-gray-600" />}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              className="hidden"
            />
          </div>

          {/* User Info */}
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                {user?.role}
              </span>
            </div>
            
            {/* Remove Photo Button */}
            {user?.profilePicture && (
              <button
                onClick={handleRemovePhoto}
                disabled={deletePhotoMutation.isPending}
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4 inline mr-1" />
                {t('profile.removePhoto')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Height Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Ruler className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">{t('profile.height')}</span>
            </div>
            {!isEditingHeight && (
              <button onClick={() => setIsEditingHeight(true)} className="text-xs text-blue-600 hover:text-blue-700">
                {t('profile.edit')}
              </button>
            )}
          </div>
          
          {isEditingHeight ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={heightValue}
                onChange={(e) => setHeightValue(e.target.value)}
                className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="cm"
              />
              <span className="text-gray-500">cm</span>
              <button onClick={handleUpdateHeight} className="px-2 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                <Check className="h-3 w-3" />
              </button>
              <button onClick={() => setIsEditingHeight(false)} className="px-2 py-1 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50">
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {user?.height ? `${user.height} cm` : t('profile.notSet')}
            </p>
          )}
        </div>

        {/* Current Weight Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Weight className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">{t('profile.currentWeight')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {latestWeight ? `${latestWeight} kg` : t('profile.notRecorded')}
          </p>
          {weightChange && (
            <p className={`text-xs mt-1 ${isWeightDown ? 'text-green-500' : 'text-red-500'}`}>
              {isWeightDown ? '↓' : '↑'} {Math.abs(weightChange)} kg {t('profile.fromStart')}
            </p>
          )}
        </div>

        {/* Total Entries Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">{t('profile.totalEntries')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalEntries}</p>
          <button onClick={() => setShowWeightForm(!showWeightForm)} className="text-xs text-blue-500 mt-1 hover:underline">
            + {t('profile.addWeight')}
          </button>
        </div>
      </div>

      {/* Add Weight Form */}
      {showWeightForm && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="0.1"
              value={weightValue}
              onChange={(e) => setWeightValue(e.target.value)}
              placeholder={t('profile.weightPlaceholder')}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleAddWeight} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              {t('profile.save')}
            </button>
            <button onClick={() => setShowWeightForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100">
              {t('profile.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Weight Progress Chart */}
      {weightHistory?.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">{t('profile.weightProgress')}</h3>
            </div>
            <div className="text-xs text-gray-400">
              <FlameIcon className="h-3 w-3 inline text-orange-500" /> {totalEntries} {t('profile.records')}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatWeightData(weightHistory)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} width={30} />
                <Tooltip 
                  contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value} kg`, t('profile.weight')]}
                />
                <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Weight History Table */}
      {weightHistory?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">{t('profile.weightHistory')}</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
            {[...weightHistory].reverse().slice(0, 10).map((entry, idx) => {
              const prevEntry = weightHistory[weightHistory.length - 1 - (idx + 1)];
              const change = prevEntry ? (entry.weight - prevEntry.weight).toFixed(1) : null;
              return (
                <div key={idx} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{format(new Date(entry.date), 'MMMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900">{entry.weight} kg</span>
                    {change && (
                      <span className={`text-xs ${change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {change >= 0 ? `+${change}` : change} kg
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Flame icon component
const FlameIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012 14c-.621.621-1.5 1.5-2.121 2.121z" />
  </svg>
);

export default Profile;