import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { isAdmin } from '../../firebase/authService';
import { getAllHelpRequests, updateHelpRequestStatus, addAdminReply, deleteHelpRequest } from '../../firebase/helpService';
import MotionWrapper from '../../components/animations/MotionWrapper';
import { Search, MessageSquare, CheckCircle, XCircle, Clock, Send, Trash2, User } from 'lucide-react';

// Help request status types
type HelpStatus = 'open' | 'inProgress' | 'resolved';

// Define interfaces for help request data
interface HelpRequest {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: HelpStatus;
  replies?: HelpReply[];
  createdAt: any;
  updatedAt?: any;
}

interface HelpReply {
  id: string;
  message: string;
  isAdmin: boolean;
  createdAt: any;
}

const HelpManagementPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<HelpRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<HelpStatus | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check admin status on mount
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const adminStatus = await isAdmin();
        if (!adminStatus) {
          navigate('/signin'); // Redirect non-admins
          return;
        }

        // Load help requests
        await loadHelpRequests();
      } catch (err: any) {
        setError(err.message || 'Error loading help requests');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  // Load all help requests
  const loadHelpRequests = async () => {
    try {
      const helpData = await getAllHelpRequests();
      setHelpRequests(helpData);
      applyFilters(helpData, searchTerm, statusFilter);
      
      // Update selected request if it exists
      if (selectedRequest) {
        const updatedRequest = helpData.find((req: HelpRequest) => req.id === selectedRequest.id);
        if (updatedRequest) {
          setSelectedRequest(updatedRequest);
        }
      }
    } catch (err: any) {
      console.error('Error loading help requests:', err);
      setError('Failed to load help requests. Please try again.');
    }
  };

  // Apply filters (search and status)
  const applyFilters = (requests: HelpRequest[], search: string, status: HelpStatus | 'all') => {
    let filtered = [...requests];
    
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(request => request.status === status);
    }
    
    // Apply search filter
    if (search.trim() !== '') {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(request => 
        request.name.toLowerCase().includes(lowerSearch) || 
        request.email.toLowerCase().includes(lowerSearch) ||
        request.subject.toLowerCase().includes(lowerSearch) ||
        request.message.toLowerCase().includes(lowerSearch)
      );
    }
    
    setFilteredRequests(filtered);
  };

  // Update filters when search or status changes
  useEffect(() => {
    applyFilters(helpRequests, searchTerm, statusFilter);
  }, [searchTerm, statusFilter, helpRequests]);

  // Format date for display
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore Timestamp objects
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return new Date(timestamp.toDate()).toLocaleString();
    }
    
    // Handle Date objects or ISO strings
    return new Date(timestamp).toLocaleString();
  };

  // Update help request status
  const handleUpdateStatus = async (id: string, status: HelpStatus) => {
    try {
      setLoading(true);
      await updateHelpRequestStatus(id, status);
      
      // Reload all help requests to get updated data
      await loadHelpRequests();
      
      setSuccess(`Status updated to ${status}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // Send admin reply
  const handleSendReply = async () => {
    if (!selectedRequest || !replyMessage.trim()) return;
    
    try {
      setLoading(true);
      await addAdminReply(selectedRequest.id, replyMessage);
      
      // Clear reply message
      setReplyMessage('');
      
      // Update status to in-progress if currently open
      if (selectedRequest.status === 'open') {
        await updateHelpRequestStatus(selectedRequest.id, 'inProgress');
      }
      
      // Reload all help requests to get updated data
      await loadHelpRequests();
      
      setSuccess('Reply sent successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  // Delete help request
  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this help request? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await deleteHelpRequest(id);
      
      // Update local state
      const updatedRequests = helpRequests.filter(req => req.id !== id);
      setHelpRequests(updatedRequests);
      
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest(null);
      }
      
      setSuccess('Help request deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete help request');
    } finally {
      setLoading(false);
    }
  };

  // Get badge color based on status
  const getStatusBadge = (status: HelpStatus) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'inProgress':
        return 'bg-blue-500/10 text-blue-500';
      case 'resolved':
        return 'bg-green-500/10 text-green-500';
    }
  };

  // Get status display text
  const getStatusText = (status: HelpStatus) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'inProgress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MotionWrapper variant="bouncyFadeIn">
        <div className="max-w-7xl mx-auto">
          <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
            Help Requests
          </h1>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
              {error}
              <button 
                className="ml-4 underline"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500">
              {success}
              <button 
                className="ml-4 underline"
                onClick={() => setSuccess(null)}
              >
                Dismiss
              </button>
            </div>
          )}
          
          {/* Search and Filters */}
          <div className={`p-4 mb-6 rounded-lg ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'} flex flex-wrap items-center justify-between gap-4`}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search help requests..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-black/20 text-textLight placeholder:text-gray-500' 
                    : 'bg-white text-textDark placeholder:text-gray-400'
                } border border-transparent focus:border-accent focus:outline-none`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as HelpStatus | 'all')}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-black/20 text-textLight' 
                  : 'bg-white text-textDark'
              } border border-transparent focus:border-accent focus:outline-none`}
            >
              <option value="all">All Requests</option>
              <option value="open">Open</option>
              <option value="inProgress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Help Requests List */}
            <div className={`lg:col-span-1 p-4 rounded-lg ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'} h-[calc(100vh-240px)] overflow-y-auto`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                Requests ({filteredRequests.length})
              </h2>
              
              {filteredRequests.length === 0 ? (
                <p className="text-center py-8 opacity-70">No help requests found</p>
              ) : (
                <div className="space-y-2">
                  {filteredRequests.map((request) => (
                    <div 
                      key={request.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedRequest?.id === request.id
                          ? isDarkMode ? 'bg-accent/20 border-l-4 border-accent' : 'bg-accent/10 border-l-4 border-accent'
                          : isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedRequest(request)}
                    >
                      <div className="flex items-center mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isDarkMode ? 'bg-white/10' : 'bg-gray-100'
                        }`}>
                          <User className="h-5 w-5" />
                        </div>
                        <div className="ml-3">
                          <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                            {request.name}
                          </p>
                          <p className="text-sm opacity-70">{request.email}</p>
                        </div>
                        <div className="ml-auto">
                          <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm font-medium truncate">{request.subject}</p>
                      <div className="flex items-center justify-between mt-1 text-xs opacity-70">
                        <span>{formatDate(request.createdAt).split(',')[0]}</span>
                        <div className="flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          <span>{(request.replies || []).length} {(request.replies || []).length === 1 ? 'reply' : 'replies'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Help Request Details */}
            <div className={`lg:col-span-2 rounded-lg ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'} h-[calc(100vh-240px)] overflow-hidden flex flex-col`}>
              {!selectedRequest ? (
                <div className="flex flex-col items-center justify-center h-full p-6">
                  <MessageSquare className={`h-16 w-16 ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`} />
                  <p className="mt-4 text-lg opacity-70">Select a help request to view details</p>
                </div>
              ) : (
                <>
                  {/* Request Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between mb-2">
                      <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                        {selectedRequest.subject}
                      </h2>
                      
                      <div className="flex space-x-2">
                        {selectedRequest.status !== 'resolved' && (
                          <button
                            onClick={() => handleUpdateStatus(selectedRequest.id, 'resolved')}
                            className="flex items-center px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Resolved
                          </button>
                        )}
                        
                        {selectedRequest.status === 'resolved' && (
                          <button
                            onClick={() => handleUpdateStatus(selectedRequest.id, 'open')}
                            className="flex items-center px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Reopen
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteRequest(selectedRequest.id)}
                          className="flex items-center px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                          {selectedRequest.name} ({selectedRequest.email})
                        </p>
                        <p className="text-sm opacity-70">
                          Submitted on {formatDate(selectedRequest.createdAt)}
                        </p>
                      </div>
                      
                      <div>
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(selectedRequest.status)}`}>
                          {getStatusText(selectedRequest.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Initial message */}
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-black/10' : 'bg-gray-50'}`}>
                      <p className={`${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                        {selectedRequest.message}
                      </p>
                    </div>
                    
                    {/* Replies */}
                    {selectedRequest.replies && selectedRequest.replies.map((reply) => (
                      <div 
                        key={reply.id}
                        className={`p-4 rounded-lg ${
                          reply.isAdmin 
                            ? isDarkMode ? 'bg-accent/10 ml-8' : 'bg-accent/5 ml-8' 
                            : isDarkMode ? 'bg-black/10' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isDarkMode ? 'bg-white/10' : 'bg-gray-100'
                          } ${reply.isAdmin ? 'bg-accent/20' : ''}`}>
                            {reply.isAdmin ? (
                              <User className="h-4 w-4 text-accent" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </div>
                          <div className="ml-2">
                            <p className="text-sm font-medium">
                              {reply.isAdmin ? 'Admin' : selectedRequest.name}
                            </p>
                            <p className="text-xs opacity-70">
                              {formatDate(reply.createdAt)}
                            </p>
                          </div>
                        </div>
                        <p className={`${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                          {reply.message}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Reply Box */}
                  {selectedRequest.status !== 'resolved' && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-surface">
                      <div className="flex space-x-2">
                        <textarea 
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Type your reply here..."
                          className={`flex-1 px-4 py-2 rounded-lg ${
                            isDarkMode 
                              ? 'bg-black/20 text-textLight placeholder:text-gray-500' 
                              : 'bg-white text-textDark placeholder:text-gray-400'
                          } border border-transparent focus:border-accent focus:outline-none`}
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={handleSendReply}
                          disabled={!replyMessage.trim()}
                          className={`flex items-center px-4 py-2 rounded-lg text-white ${
                            !replyMessage.trim() 
                              ? 'bg-gray-300 cursor-not-allowed' 
                              : 'bg-accent hover:bg-accent/80'
                          } transition-colors`}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </MotionWrapper>
    </div>
  );
};

export default HelpManagementPage; 