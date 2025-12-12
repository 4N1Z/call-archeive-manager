import React from 'react';
import { Recording } from '../types';
import { Play, Download, Clock, ArrowDownLeft, ArrowUpRight, Users, Hash } from 'lucide-react';

interface RecordingListProps {
  recordings: Recording[];
  loading: boolean;
  onPlay: (recording: Recording) => void;
}

const RecordingList: React.FC<RecordingListProps> = ({ recordings, loading, onPlay }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-gray-500 text-sm animate-pulse">Querying database...</p>
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
        <div className="mx-auto h-12 w-12 text-gray-300 mb-4">
          <DatabaseIcon />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No recordings found</h3>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Direction / ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Workgroup
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From (ANI)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                To (DNIS)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recordings.map((rec) => (
              <tr key={rec.RecordingID} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                      rec.Direction === 'Inbound' ? 'bg-green-100 text-green-600' :
                      rec.Direction === 'Outbound' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {rec.Direction === 'Inbound' && <ArrowDownLeft size={16} />}
                      {rec.Direction === 'Outbound' && <ArrowUpRight size={16} />}
                      {rec.Direction === 'Intercom' && <Users size={16} />}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{rec.Direction}</div>
                      <div className="text-xs text-gray-500 font-mono">{rec.RecordingID}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(rec.RecordingDate)}</div>
                  <div className="text-xs text-gray-500 mt-0.5 inline-flex items-center px-2 py-0.5 rounded bg-gray-100">
                    {rec.Workgroup}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{rec.ANI}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[150px]" title={rec.FromConnection}>
                    Conn: {rec.FromConnection}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{rec.DNIS}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[150px]" title={rec.ToConnection}>
                    Conn: {rec.ToConnection}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500 font-mono">
                    <Clock size={14} className="mr-1.5 text-gray-400" />
                    {formatDuration(rec.Duration)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-3">
                    <button 
                      onClick={() => onPlay(rec)}
                      className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1 hover:bg-indigo-50 px-2 py-1 rounded transition-all"
                    >
                      <Play size={16} fill="currentColor" />
                      <span>Play</span>
                    </button>
                    <a 
                      href={rec.FilePath}
                      download={`recording-${rec.RecordingID}`}
                      className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all"
                      title="Download"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download size={16} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
        <p className="text-xs text-gray-500">
          Showing {recordings.length} records
        </p>
      </div>
    </div>
  );
};

const DatabaseIcon = () => (
  <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

export default RecordingList;