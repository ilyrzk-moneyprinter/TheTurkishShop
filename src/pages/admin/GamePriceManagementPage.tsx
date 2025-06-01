import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Search, Filter, ExternalLink, Clock, Download } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { GamePrice, getAllGamePriceChecks } from '../../firebase/gamePriceService';
import AdminLayout from '../../components/admin/AdminLayout';

const GamePriceManagementPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [gamePrices, setGamePrices] = useState<GamePrice[]>([]);
  const [filteredGamePrices, setFilteredGamePrices] = useState<GamePrice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load game price checks
  useEffect(() => {
    const loadGamePriceChecks = async () => {
      try {
        setIsLoading(true);
        const data = await getAllGamePriceChecks();
        setGamePrices(data);
        setFilteredGamePrices(data);
      } catch (error) {
        console.error('Error loading game price checks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGamePriceChecks();
  }, []);

  // Filter and sort game price checks
  useEffect(() => {
    let filtered = [...gamePrices];

    // Apply platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(game => game.platform.toLowerCase() === platformFilter.toLowerCase());
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.gameTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (game.userEmail && game.userEmail.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const timestampA = a.createdAt.toMillis();
      const timestampB = b.createdAt.toMillis();
      return sortOrder === 'desc' ? timestampB - timestampA : timestampA - timestampB;
    });

    setFilteredGamePrices(filtered);
  }, [gamePrices, searchTerm, platformFilter, sortOrder]);

  // Format date
  const formatDate = (timestamp: any): string => {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Format price with currency symbol
  const formatPrice = (price: number, currency: string): string => {
    const currencySymbols: Record<string, string> = {
      'GBP': '£',
      'USD': '$',
      'EUR': '€'
    };
    
    const symbol = currencySymbols[currency] || currency + ' ';
    return `${symbol}${price.toFixed(2)}`;
  };

  // Export data to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'User', 'Game Title', 'Platform', 'Original Price', 'Discounted Price', 'Currency', 'Status', 'URL'];
    
    const rows = filteredGamePrices.map(game => [
      formatDate(game.createdAt),
      game.userEmail || 'Anonymous',
      game.gameTitle,
      game.platform,
      game.originalPrice,
      game.discountedPrice,
      game.currency,
      game.status,
      game.originalUrl
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `game-price-checks-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get platform badge
  const getPlatformBadge = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'steam':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-[#1b2838] text-white rounded-full">
            Steam
          </span>
        );
      case 'playstation':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-[#006FCD] text-white rounded-full">
            PlayStation
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-500 text-white rounded-full">
            {platform}
          </span>
        );
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-500 text-white rounded-full">
            Completed
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-500 text-white rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <AdminLayout title="Game Price Checker Management">
      <div className="p-6">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Game Price Check History
            </h1>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={exportToCSV}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              >
                <Download size={16} />
                <span>Export CSV</span>
              </motion.button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
              </div>
              <input
                type="text"
                placeholder="Search by game title, URL, or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 w-full py-2 px-4 rounded-lg focus:ring-2 focus:ring-accent ${
                  isDarkMode
                    ? 'bg-gray-700 text-white border-gray-600 focus:border-accent'
                    : 'bg-white text-gray-800 border-gray-300 focus:border-accent'
                } border`}
              />
            </div>

            <div className="flex gap-2">
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className={`py-2 px-4 rounded-lg focus:ring-2 focus:ring-accent ${
                  isDarkMode
                    ? 'bg-gray-700 text-white border-gray-600 focus:border-accent'
                    : 'bg-white text-gray-800 border-gray-300 focus:border-accent'
                } border`}
              >
                <option value="all">All Platforms</option>
                <option value="steam">Steam</option>
                <option value="playstation">PlayStation</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className={`py-2 px-4 rounded-lg focus:ring-2 focus:ring-accent ${
                  isDarkMode
                    ? 'bg-gray-700 text-white border-gray-600 focus:border-accent'
                    : 'bg-white text-gray-800 border-gray-300 focus:border-accent'
                } border`}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Date/Time
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    User
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Game
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Platform
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Original Price
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Discounted Price
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}`}>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className={`w-6 h-6 rounded-full border-2 border-t-accent ${
                          isDarkMode ? 'border-gray-600' : 'border-gray-200'
                        } animate-spin`}></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredGamePrices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No game price checks found
                    </td>
                  </tr>
                ) : (
                  filteredGamePrices.map((game) => (
                    <tr key={game.id} className={`hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                        <div className="flex items-center">
                          <Clock size={16} className="mr-2 text-gray-400" />
                          {formatDate(game.createdAt)}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                        {game.userEmail || 'Anonymous'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                        {game.gameTitle}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                        {getPlatformBadge(game.platform)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                        {formatPrice(game.originalPrice, game.currency)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>
                        {formatPrice(game.discountedPrice, game.currency)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                        {getStatusBadge(game.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end space-x-2">
                          <a
                            href={game.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-1 rounded-full ${isDarkMode ? 'text-blue-400 hover:bg-blue-900/20' : 'text-blue-600 hover:bg-blue-100'}`}
                            title="View original URL"
                          >
                            <ExternalLink size={18} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default GamePriceManagementPage; 