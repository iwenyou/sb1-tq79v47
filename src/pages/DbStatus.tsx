import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

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

  useEffect(() => {
    fetchDatabaseStatus();
  }, []);

  const fetchDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/db-status', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.tables)) {
        throw new Error('Invalid response format');
      }

      setTables(data.tables.map((t: any) => ({ ...t, isExpanded: false })));
      setError(null);
    } catch (err) {
      console.error('Error fetching database status:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleTableExpansion = (index: number) => {
    setTables(prevTables =>
      prevTables.map((table, i) =>
        i === index ? { ...table, isExpanded: !table.isExpanded } : table
      )
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="bg-red-50 p-6 rounded-lg">
          <h2 className="text-lg font-medium text-red-800 mb-4">Error Loading Database Status</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={fetchDatabaseStatus}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Database Status</h1>
        <button
          onClick={fetchDatabaseStatus}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-6">
        {tables.map((table, index) => (
          <div key={table.name} className="bg-white shadow-lg rounded-lg overflow-hidden">
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

            {table.isExpanded && table.data.length > 0 && (
              <div className="px-6 pb-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(table.data[0]).map((key) => (
                        <th
                          key={key}
                          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {table.data.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {Object.entries(row).map(([key, value]) => (
                          <td
                            key={key}
                            className="px-3 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {typeof value === 'object'
                              ? JSON.stringify(value)
                              : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {table.isExpanded && table.data.length === 0 && (
              <div className="px-6 pb-6 text-center text-gray-500">
                No records found in this table
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}