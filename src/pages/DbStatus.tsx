import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, RefreshCw } from 'lucide-react';

interface TableData {
  name: string;
  count: number;
  data: any[];
  isExpanded: boolean;
}

export function DbStatus() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDatabaseStatus = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/db-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401 
            ? 'Please log in to view database status' 
            : 'Failed to fetch database status'
        );
      }

      const data = await response.json();
      setTables(data.tables.map((t: any) => ({ ...t, isExpanded: false })));
      setError(null);
    } catch (err) {
      console.error('Error fetching database status:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDatabaseStatus();
  }, []);

  const toggleTableExpansion = (index: number) => {
    setTables(prevTables =>
      prevTables.map((table, i) =>
        i === index ? { ...table, isExpanded: !table.isExpanded } : table
      )
    );
  };

  const renderValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Database Status</h1>
          <p className="mt-2 text-gray-600">View and monitor database tables and records</p>
        </div>
        <button
          onClick={fetchDatabaseStatus}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {tables.map((table, index) => (
            <div key={table.name} className="bg-white shadow rounded-lg overflow-hidden">
              <div
                className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                onClick={() => toggleTableExpansion(index)}
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{table.name}</h2>
                  <p className="text-sm text-gray-500">{table.count} records</p>
                </div>
                {table.isExpanded ? (
                  <ArrowUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ArrowDown className="h-5 w-5 text-gray-400" />
                )}
              </div>

              {table.isExpanded && (
                <div className="border-t border-gray-200">
                  {table.data.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(table.data[0]).map((key) => (
                              <th
                                key={key}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {table.data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {Object.entries(row).map(([key, value]) => (
                                <td
                                  key={key}
                                  className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-900 font-mono"
                                >
                                  {renderValue(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="px-6 py-4 text-sm text-gray-500 text-center">
                      No records found
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}