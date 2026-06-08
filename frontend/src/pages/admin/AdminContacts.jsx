// frontend/src/pages/admin/AdminContacts.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Trash2,
  Reply,
  Clock,
  User,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  MessageCircle,
  Star,
  TrendingUp,
  Loader2,
  Send
} from 'lucide-react';
import adminService from '../../services/admin.service';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AdminContacts = () => {
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  // Fetch contacts using adminService
  const { data: contactsData, isLoading, refetch } = useQuery({
    queryKey: ['adminContacts', filterStatus],
    queryFn: async () => {
      const params = filterStatus ? { status: filterStatus } : {};
      const response = await adminService.getAllContacts(params);
      return response.data;
    },
  });

  // Fetch stats using adminService
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['contactStats'],
    queryFn: async () => {
      const response = await adminService.getContactStats();
      return response.data;
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, adminNote }) => {
      setUpdatingStatus(true);
      return await adminService.updateContactStatus(id, { status, adminNote });
    },
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries(['adminContacts']);
      queryClient.invalidateQueries(['contactStats']);
      setSelectedContact(null);
      setStatusNote('');
      setUpdatingStatus(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
      setUpdatingStatus(false);
    },
  });

  // Send reply mutation
  const sendReplyMutation = useMutation({
    mutationFn: async ({ id, replyMessage, subject }) => {
      setSendingReply(true);
      return await adminService.sendReply(id, { replyMessage, subject });
    },
    onSuccess: () => {
      toast.success('Reply sent successfully!');
      queryClient.invalidateQueries(['adminContacts']);
      queryClient.invalidateQueries(['contactStats']);
      setShowReplyModal(false);
      setReplyMessage('');
      setSendingReply(false);
      setSelectedContact(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send reply');
      setSendingReply(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await adminService.deleteContact(id);
    },
    onSuccess: () => {
      toast.success('Contact message deleted');
      queryClient.invalidateQueries(['adminContacts']);
      queryClient.invalidateQueries(['contactStats']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete message');
    },
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      read: { color: 'bg-blue-100 text-blue-800', icon: Eye, label: 'Read' },
      replied: { color: 'bg-purple-100 text-purple-800', icon: Reply, label: 'Replied' },
      resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Resolved' }
    };
    const Badge = badges[status]?.icon || AlertCircle;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${badges[status]?.color || 'bg-gray-100 text-gray-800'}`}>
        <Badge className="h-3 w-3" />
        {badges[status]?.label || status}
      </span>
    );
  };

  const handleSendReply = () => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }
    sendReplyMutation.mutate({
      id: selectedContact._id,
      replyMessage: replyMessage,
      subject: `Re: ${selectedContact.subject || 'Your inquiry'}`
    });
  };

  const contacts = contactsData?.contacts || [];
  const stats = statsData?.stats || {};

  const statsCards = [
    { label: 'Total', value: stats.total || 0, icon: MessageCircle, color: 'blue' },
    { label: 'Pending', value: stats.pending || 0, icon: Clock, color: 'yellow' },
    { label: 'Replied', value: stats.replied || 0, icon: Reply, color: 'purple' },
    { label: 'Resolved', value: stats.resolved || 0, icon: CheckCircle, color: 'green' },
    { label: 'Today', value: stats.today || 0, icon: Calendar, color: 'orange' },
    { label: 'This Week', value: stats.thisWeek || 0, icon: TrendingUp, color: 'teal' },
  ];

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.subject && contact.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-600 mt-1">Manage and respond to user inquiries</p>
        </div>
        <button onClick={() => refetch()} className="p-2 bg-white border rounded-lg hover:bg-gray-50 transition">
          <RefreshCw className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsCards.map((stat, idx) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            yellow: 'bg-yellow-50 text-yellow-600',
            purple: 'bg-purple-50 text-purple-600',
            green: 'bg-green-50 text-green-600',
            orange: 'bg-orange-50 text-orange-600',
            teal: 'bg-teal-50 text-teal-600',
          };
          return (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
                <div className={`p-2 rounded-lg ${colorClasses[stat.color]}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative w-48">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-lg appearance-none bg-white"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredContacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.email}</p>
                        {contact.userId && (
                          <p className="text-xs text-gray-400 capitalize">Role: {contact.userRole}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 max-w-[200px] truncate">
                        {contact.subject || 'No subject'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-[250px] line-clamp-2">
                        {contact.message}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(contact.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(contact.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedContact(contact)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this message?')) {
                              deleteMutation.mutate(contact._id);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No contact messages found</p>
          </div>
        )}
      </div>

      {/* Contact Details Modal with Reply Functionality */}
      {selectedContact && !showReplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Message Details</h2>
              <button onClick={() => setSelectedContact(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">From</label>
                  <p className="font-medium text-gray-900">{selectedContact.name}</p>
                  <p className="text-sm text-gray-500">{selectedContact.email}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Role</label>
                  <p className="font-medium text-gray-900 capitalize">{selectedContact.userRole || 'User'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Date</label>
                  <p className="text-sm text-gray-900">
                    {format(new Date(selectedContact.createdAt), 'MMMM dd, yyyy h:mm a')}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Status</label>
                  <div>{getStatusBadge(selectedContact.status)}</div>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-500">Subject</label>
                <p className="text-gray-900">{selectedContact.subject || 'No subject'}</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-500">Message</label>
                <div className="bg-gray-50 rounded-lg p-4 mt-1">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-500">Update Status</label>
                <div className="flex gap-2 mt-1">
                  <select
                    value={selectedContact.status}
                    onChange={(e) => setSelectedContact({ ...selectedContact, status: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="pending">Pending</option>
                    <option value="read">Mark as Read</option>
                    <option value="replied">Replied</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button
                    onClick={() => updateStatusMutation.mutate({ 
                      id: selectedContact._id, 
                      status: selectedContact.status,
                      adminNote: statusNote 
                    })}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-500">Admin Note (Optional)</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg mt-1"
                  placeholder="Add internal note..."
                />
              </div>
              
              <div className="pt-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowReplyModal(true)}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                  <Reply className="h-4 w-4" />
                  Reply to Customer
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this message?')) {
                      deleteMutation.mutate(selectedContact._id);
                      setSelectedContact(null);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Reply to {selectedContact.name}</h2>
              <button onClick={() => setShowReplyModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-2">Original message:</p>
                <p className="text-gray-700">{selectedContact.message}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Reply <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  placeholder="Type your reply here..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSendReply}
                  disabled={sendingReply || !replyMessage.trim()}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sendingReply ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send Reply
                </button>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;