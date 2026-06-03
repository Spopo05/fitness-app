import { X, Download, User } from 'lucide-react';

const ProfilePictureModal = ({ isOpen, onClose, imageUrl, name }) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${name || 'profile'}-picture.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {name ? `${name}'s Profile Picture` : 'Profile Picture'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Image */}
        <div className="p-4 flex items-center justify-center bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="max-w-full max-h-[60vh] object-contain rounded-lg"
            />
          ) : (
            <div className="w-48 h-48 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <User className="h-24 w-24 text-white" />
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          {imageUrl && (
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureModal;