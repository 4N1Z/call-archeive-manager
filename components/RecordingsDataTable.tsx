import React, { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  Row
} from "@tanstack/react-table";
import { Recording } from '../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Play, Download, ArrowUpDown, ChevronDown, ChevronRight, ArrowDownLeft, ArrowUpRight, Users } from 'lucide-react';

interface RecordingsDataTableProps {
  data: Recording[];
  loading: boolean;
  onPlay: (recording: Recording) => void;
}

const formatDuration = (seconds: number) => {
  if (!seconds && seconds !== 0) return '0m 0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const formatDate = (isoString: string) => {
  try {
    return new Date(isoString).toLocaleString();
  } catch (e) {
    return isoString;
  }
};

const formatFileSize = (bytes: number | undefined) => {
  if (!bytes) return '-';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function RecordingsDataTable({
  data,
  loading,
  onPlay,
}: RecordingsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRowExpanded = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const columns: ColumnDef<Recording>[] = [
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => {
        return (
          <button
            onClick={() => toggleRowExpanded(row.original.RecordingID)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            {expandedRows[row.original.RecordingID] ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
        )
      },
    },
    {
      accessorKey: "Direction",
      header: "Dir",
      cell: ({ row }) => {
        const direction = row.getValue("Direction") as string;
        return (
          <div className="flex items-center gap-2" title={direction}>
            <div className={`p-1.5 rounded-full flex items-center justify-center ${
              direction === 'Inbound' ? 'bg-green-100 text-green-600' :
              direction === 'Outbound' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {direction === 'Inbound' && <ArrowDownLeft size={14} />}
              {direction === 'Outbound' && <ArrowUpRight size={14} />}
              {direction === 'Intercom' && <Users size={14} />}
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: "RecordingID",
      header: "ID",
      cell: ({ row }) => <span className="font-mono text-xs text-gray-600">{row.getValue("RecordingID")}</span>
    },
    {
      accessorKey: "RecordingDate",
      header: ({ column }) => {
        return (
          <button
            className="flex items-center hover:text-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </button>
        )
      },
      cell: ({ row }) => <span className="text-xs">{formatDate(row.getValue("RecordingDate"))}</span>,
    },
    {
      accessorKey: "Duration",
      header: "Duration",
      cell: ({ row }) => <span className="text-xs font-mono">{formatDuration(row.getValue("Duration"))}</span>,
    },
    {
      accessorKey: "ANI",
      header: "From (ANI)",
      cell: ({ row }) => <span className="text-xs">{row.getValue("ANI")}</span>,
    },
    {
      accessorKey: "DNIS",
      header: "To (DNIS)",
      cell: ({ row }) => <span className="text-xs">{row.getValue("DNIS")}</span>,
    },
    {
      accessorKey: "Workgroup",
      header: "Workgroup",
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
          {row.getValue("Workgroup")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const rec = row.original;
        return (
          <div className="flex items-center justify-end space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onPlay(rec);
              }}
              className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1 hover:bg-indigo-50 px-2 py-1 rounded transition-all text-xs font-medium"
            >
              <Play size={14} fill="currentColor" />
              <span>Play</span>
            </button>
            <a 
              href={rec.FilePath}
              download={`recording-${rec.RecordingID}`}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all"
              title="Download"
              onClick={(e) => e.stopPropagation()}
            >
              <Download size={14} />
            </a>
          </div>
        )
      }
    }
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      }
    }
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white rounded-md border border-gray-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="text-gray-500 text-sm animate-pulse">Loading recordings...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-200">
        <p className="text-gray-500">No recordings found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-xs font-semibold text-gray-500 uppercase tracking-wider h-10">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer hover:bg-slate-50 border-b border-gray-100"
                    onClick={() => toggleRowExpanded(row.original.RecordingID)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandedRows[row.original.RecordingID] && (
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                      <TableCell colSpan={columns.length} className="p-0 border-b border-gray-100">
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm animate-in slide-in-from-top-2 duration-200">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Participant Details</h4>
                            <dl className="grid grid-cols-[100px_1fr] gap-2">
                              <dt className="text-gray-500">Agent:</dt>
                              <dd className="font-medium">{row.original.FirstParticipant || '-'}</dd>
                              <dt className="text-gray-500">Others:</dt>
                              <dd>{row.original.OtherParticipants || '-'}</dd>
                              <dt className="text-gray-500">From Conn:</dt>
                              <dd className="font-mono text-xs">{row.original.FromConnection || '-'}</dd>
                              <dt className="text-gray-500">To Conn:</dt>
                              <dd className="font-mono text-xs">{row.original.ToConnection || '-'}</dd>
                            </dl>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Technical Details</h4>
                            <dl className="grid grid-cols-[100px_1fr] gap-2">
                              <dt className="text-gray-500">File Size:</dt>
                              <dd>{formatFileSize(row.original.FileSize)}</dd>
                              <dt className="text-gray-500">Media Type:</dt>
                              <dd>{row.original.MediaType || '-'}</dd>
                              <dt className="text-gray-500">Tags:</dt>
                              <dd>{row.original.Tags || '-'}</dd>
                              <dt className="text-gray-500">Attributes:</dt>
                              <dd className="font-mono text-xs break-all max-h-20 overflow-y-auto">
                                {row.original.Attributes || '-'}
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-gray-500">
          Showing {table.getRowModel().rows.length} of {data.length} results
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <button
            className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

