import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import AdminReportTable from '../components/admin/AdminReportTable';
import AdminUserTable from '../components/admin/AdminUserTable';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' or 'users'

  // Reports State
  const [reports, setReports] = useState([]);
  const [reportPageInfo, setReportPageInfo] = useState({
    currPage: 0,
    totalPages: 0,
    totalElements: 0,
  });

  // Users State
  const [users, setUsers] = useState([]);

  // Common State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Reports
  const fetchReports = async (page = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/api/admin/reports', {
        params: {
          page: page,
          size: 10,
          sortDirection: 'DESC',
        },
      });

      console.log("Admin Reports Response:", response.data);

      const { status, success, data } = response.data;

      if ((status === 'SUCCESS' || success === true) && data) {
        setReports(data.content);
        setReportPageInfo(data.pageInfo);
      } else {
        setError('신고 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/api/v1/admin/users');
      console.log("Admin Users Response:", response.data);

      const { status, success, data } = response.data;
      if ((status === 'SUCCESS' || success === true) && data) {
        // data.users is the list
        setUsers(data.users); 
      } else {
        setError('유저 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data on tab change
  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports(0);
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleReportPageChange = (newPage) => {
    fetchReports(newPage);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-4xl font-black italic tracking-tighter text-white">
            <span className="text-[#ff8a00]">ADMIN</span> DASHBOARD
          </h1>
          <p className="text-gray-400">
            관리자 대시보드에서 신고 내역과 유저 정보를 관리하세요.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-800 pb-1">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 text-sm font-bold transition-colors border-b-2 ${
              activeTab === 'reports'
                ? 'border-[#ff8a00] text-[#ff8a00]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            신고 관리
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-sm font-bold transition-colors border-b-2 ${
              activeTab === 'users'
                ? 'border-[#ff8a00] text-[#ff8a00]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            유저 관리
          </button>
        </div>

        {/* Content */}
        <div className="w-full">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff8a00]"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#1e1e1e] rounded-xl border border-gray-800">
              <p className="text-red-500 font-bold text-lg mb-4">{error}</p>
              <button 
                onClick={() => activeTab === 'reports' ? fetchReports(0) : fetchUsers()}
                className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-white transition-colors"
              >
                다시 시도
              </button>
            </div>
          ) : activeTab === 'reports' ? (
            <AdminReportTable 
              reports={reports} 
              pageInfo={reportPageInfo} 
              onPageChange={handleReportPageChange} 
            />
          ) : (
            <AdminUserTable 
              users={users} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
