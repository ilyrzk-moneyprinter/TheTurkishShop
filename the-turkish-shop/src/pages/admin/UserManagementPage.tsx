import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { isAdmin } from '../../firebase/authService';
import { getAllUsers, updateUserRole, assignBenefit } from '../../firebase/userService';
import MotionWrapper from '../../components/animations/MotionWrapper';
import { Search, User, Shield, Award, Clock, Package } from 'lucide-react';

// Define interfaces for user data
interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: string;
  createdAt: any;
  lastLogin?: any;
  benefits?: string[];
  orderCount?: number;
}

const UserManagementPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isAddingBenefit, setIsAddingBenefit] = useState(false);
  const [newBenefit, setNewBenefit] = useState('');
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

        // Load users
        await loadUsers();
      } catch (err: any) {
        setError(err.message || 'Error loading user data');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  // Load all users
  const loadUsers = async () => {
    try {
      const userData = await getAllUsers();
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again.');
    }
  };

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      (user.email && user.email.toLowerCase().includes(lowerSearchTerm)) || 
      (user.displayName && user.displayName.toLowerCase().includes(lowerSearchTerm))
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Format date for display
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Never';
    
    // Handle Firestore Timestamp objects
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return new Date(timestamp.toDate()).toLocaleString();
    }
    
    // Handle Date objects or ISO strings
    return new Date(timestamp).toLocaleString();
  };

  // Change user role
  const handleRoleChange = async (uid: string, newRole: string) => {
    try {
      setLoading(true);
      await updateUserRole(uid, newRole);
      
      // Update local state
      const updatedUsers = users.map(user => {
        if (user.uid === uid) {
          return { ...user, role: newRole };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      if (selectedUser && selectedUser.uid === uid) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
      
      setSuccess(`User role updated to ${newRole}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  // Add benefit to user
  const handleAddBenefit = async () => {
    if (!selectedUser || !newBenefit.trim()) return;
    
    try {
      setLoading(true);
      await assignBenefit(selectedUser.uid, newBenefit);
      
      // Update local state
      const updatedBenefits = selectedUser.benefits ? [...selectedUser.benefits, newBenefit] : [newBenefit];
      
      const updatedUsers = users.map(user => {
        if (user.uid === selectedUser.uid) {
          return { ...user, benefits: updatedBenefits };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setSelectedUser({ ...selectedUser, benefits: updatedBenefits });
      
      setNewBenefit('');
      setIsAddingBenefit(false);
      setSuccess('Benefit added successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add benefit');
    } finally {
      setLoading(false);
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
            User Management
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
          
          {/* Search and Filter */}
          <div className={`p-4 mb-6 rounded-lg ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'}`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search users by email or name..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-black/20 text-textLight placeholder:text-gray-500' 
                    : 'bg-white text-textDark placeholder:text-gray-400'
                } border border-transparent focus:border-accent focus:outline-none`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Users List */}
            <div className={`lg:col-span-1 p-4 rounded-lg ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'} h-[calc(100vh-240px)] overflow-y-auto`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                Users ({filteredUsers.length})
              </h2>
              
              {filteredUsers.length === 0 ? (
                <p className="text-center py-8 opacity-70">No users found</p>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div 
                      key={user.uid}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUser?.uid === user.uid
                          ? isDarkMode ? 'bg-accent/20 border-l-4 border-accent' : 'bg-accent/10 border-l-4 border-accent'
                          : isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isDarkMode ? 'bg-white/10' : 'bg-gray-100'
                        }`}>
                          <User className={`h-5 w-5 ${user.role === 'admin' ? 'text-accent' : ''}`} />
                        </div>
                        <div className="ml-3">
                          <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                            {user.displayName || 'No Name'}
                          </p>
                          <p className="text-sm opacity-70">{user.email}</p>
                        </div>
                        {user.role === 'admin' && (
                          <Shield className="h-4 w-4 text-accent ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* User Details */}
            <div className={`lg:col-span-2 p-6 rounded-lg ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'} h-[calc(100vh-240px)] overflow-y-auto`}>
              {!selectedUser ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <User className={`h-16 w-16 ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`} />
                  <p className="mt-4 text-lg opacity-70">Select a user to view details</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center mb-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-white/10' : 'bg-gray-100'
                    }`}>
                      <User className={`h-8 w-8 ${selectedUser.role === 'admin' ? 'text-accent' : ''}`} />
                    </div>
                    <div className="ml-4">
                      <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                        {selectedUser.displayName || 'No Name'}
                      </h2>
                      <p className="opacity-70">{selectedUser.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-white/80'}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="h-5 w-5 text-accent" />
                        <p className="text-sm opacity-70">Role</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-lg font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                          {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRoleChange(selectedUser.uid, 'user')}
                            disabled={selectedUser.role === 'user'}
                            className={`px-3 py-1 text-sm rounded ${
                              selectedUser.role === 'user'
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            User
                          </button>
                          <button
                            onClick={() => handleRoleChange(selectedUser.uid, 'admin')}
                            disabled={selectedUser.role === 'admin'}
                            className={`px-3 py-1 text-sm rounded ${
                              selectedUser.role === 'admin'
                                ? 'bg-accent/50 text-white cursor-not-allowed'
                                : 'bg-accent text-white hover:bg-accent/80'
                            }`}
                          >
                            Admin
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-white/80'}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="h-5 w-5 text-accent" />
                        <p className="text-sm opacity-70">Account Info</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="opacity-70">Created:</span> {formatDate(selectedUser.createdAt)}
                        </p>
                        <p className="text-sm">
                          <span className="opacity-70">Last Login:</span> {formatDate(selectedUser.lastLogin)}
                        </p>
                        <p className="text-sm">
                          <span className="opacity-70">Orders:</span> {selectedUser.orderCount || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Benefits Section */}
                  <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-white/5' : 'bg-white/80'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Award className="h-5 w-5 text-accent" />
                        <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>Benefits</p>
                      </div>
                      <button
                        onClick={() => setIsAddingBenefit(true)}
                        className="text-sm text-accent hover:underline"
                      >
                        Add Benefit
                      </button>
                    </div>
                    
                    {isAddingBenefit && (
                      <div className="mb-4 p-3 rounded-lg bg-black/10">
                        <p className="text-sm mb-2">Add a new benefit:</p>
                        <div className="flex space-x-2">
                          <select
                            value={newBenefit}
                            onChange={(e) => setNewBenefit(e.target.value)}
                            className={`flex-1 px-3 py-2 rounded ${
                              isDarkMode 
                                ? 'bg-black/20 text-textLight' 
                                : 'bg-white text-textDark'
                            } border border-transparent focus:border-accent focus:outline-none`}
                          >
                            <option value="">Select a benefit</option>
                            <option value="Nitro">Discord Nitro</option>
                            <option value="Spotify">Spotify Premium</option>
                            <option value="Robux">Robux</option>
                            <option value="VIP">VIP Status</option>
                            <option value="Discount">10% Discount</option>
                          </select>
                          <button
                            onClick={handleAddBenefit}
                            disabled={!newBenefit}
                            className={`px-4 py-2 rounded ${
                              !newBenefit
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-accent text-white hover:bg-accent/80'
                            }`}
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingBenefit(false);
                              setNewBenefit('');
                            }}
                            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {(!selectedUser.benefits || selectedUser.benefits.length === 0) ? (
                      <p className="text-sm opacity-70">No benefits assigned</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedUser.benefits.map((benefit, index) => (
                          <div 
                            key={index}
                            className={`p-2 rounded-lg flex items-center justify-between ${
                              isDarkMode ? 'bg-black/10' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center">
                              <Award className="h-4 w-4 text-accent mr-2" />
                              <span>{benefit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Order History */}
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-white/80'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-accent" />
                        <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>Order History</p>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/orders?email=${selectedUser.email}`)}
                        className="text-sm text-accent hover:underline"
                      >
                        View All Orders
                      </button>
                    </div>
                    
                    {selectedUser.orderCount === 0 ? (
                      <p className="text-sm opacity-70">No orders found</p>
                    ) : (
                      <p className="text-sm">
                        This user has placed {selectedUser.orderCount || 0} orders. Click "View All Orders" to see details.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </MotionWrapper>
    </div>
  );
};

export default UserManagementPage; 