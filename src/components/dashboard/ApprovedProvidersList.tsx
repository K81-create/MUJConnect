import React from 'react';
import { Power, Star } from 'lucide-react';

interface Provider {
    _id: string;
    personalDetails: { name: string; email: string };
    serviceCategory: string;
    isAvailable: boolean;
    rating?: number; // Optional if we haven't implemented ratings on this model yet
}

interface ApprovedProvidersListProps {
    providers: Provider[];
    onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export function ApprovedProvidersList({ providers, onToggleStatus }: ApprovedProvidersListProps) {
    if (providers.length === 0) {
        return <div className="p-8 text-center text-gray-500">No active providers</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map(provider => (
                <div key={provider._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                                {provider.personalDetails.name[0]}
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">{provider.personalDetails.name}</h4>
                                <div className="flex items-center text-xs text-gray-500 gap-2">
                                    <span>{provider.serviceCategory}</span>
                                    <span className="flex items-center text-yellow-500">
                                        <Star size={10} fill="currentColor" className="mr-0.5" />
                                        {provider.rating || 'New'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => onToggleStatus(provider._id, provider.isAvailable)}
                            className={`
                                w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out
                                ${provider.isAvailable ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'}
                            `}
                            title="Toggle Availability"
                        >
                            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            className="flex-1 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            onClick={() => alert(`View/Edit details for ${provider.personalDetails.name} (Coming Soon)`)}
                        >
                            View Details
                        </button>
                        <button
                            className="flex-1 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => alert(`Manage Documents for ${provider.personalDetails.name} (Coming Soon)`)}
                        >
                            Documents
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
