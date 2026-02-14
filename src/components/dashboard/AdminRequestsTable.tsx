import React, { useState } from 'react';
import { Check, X, Eye, FileText } from 'lucide-react';
import { Button } from '../ui/Button';

interface Request {
    _id: string;
    personalDetails: { name: string; email: string };
    serviceCategory: string;
    experience: number;
    status: string;
    // ... other fields
}

interface AdminRequestsTableProps {
    requests: Request[];
    onApprove: (id: string) => void;
    onReject: (id: string, reason: string) => void;
}

export function AdminRequestsTable({ requests, onApprove, onReject }: AdminRequestsTableProps) {
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [reason, setReason] = useState('');

    const handleRejectSubmit = () => {
        if (rejectingId && reason) {
            onReject(rejectingId, reason);
            setRejectingId(null);
            setReason('');
        }
    };

    if (requests.length === 0) {
        return <div className="p-8 text-center text-gray-500">No pending requests</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stakeholder</th>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-50 uppercase tracking-wider">Category</th>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-50 uppercase tracking-wider">Exp</th>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-50 uppercase tracking-wider">Documents</th>
                        <th className="py-4 px-6 text-right text-xs font-semibold text-gray-50 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {requests.map((request) => (
                        <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                        {request.personalDetails.name[0]}
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{request.personalDetails.name}</div>
                                        <div className="text-sm text-gray-500">{request.personalDetails.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-500">
                                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                                    {request.serviceCategory}
                                </span>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-500">
                                {request.experience} Years
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-500">
                                <div className="flex items-center gap-2 text-blue-600 cursor-pointer hover:underline">
                                    <FileText size={16} />
                                    <span>View</span>
                                </div>
                            </td>
                            <td className="py-4 px-6 text-right text-sm font-medium">
                                {rejectingId === request._id ? (
                                    <div className="flex items-center justify-end gap-2 animate-in fade-in slide-in-from-right-5">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Reason for rejection..."
                                            className="border rounded px-2 py-1 text-xs w-48"
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                        />
                                        <button onClick={handleRejectSubmit} className="text-red-600 hover:bg-red-50 p-1 rounded"><Check size={16} /></button>
                                        <button onClick={() => setRejectingId(null)} className="text-gray-400 hover:bg-gray-100 p-1 rounded"><X size={16} /></button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onApprove(request._id)}
                                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                            title="Approve"
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button
                                            onClick={() => setRejectingId(request._id)}
                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                            title="Reject"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
