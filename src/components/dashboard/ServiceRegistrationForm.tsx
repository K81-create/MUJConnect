import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Upload, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface ServiceRegistrationFormProps {
    userEmail: string;
    userName: string;
    onSubmit: (data: any) => Promise<void>;
}

const CATEGORIES = ['Cleaning', 'Salon', 'Repair', 'Plumbing', 'Electrical'];

const SPECIFIC_SERVICES: Record<string, string[]> = {
    'Cleaning': ['Home Cleaning', 'Bathroom Cleaning', 'Kitchen Cleaning'],
    'Salon': ['Haircut_M', 'Haircut_F', 'Facial', 'Waxing'],
    'Repair': ['AC Repair', 'Washing Machine Repair', 'Refrigerator Repair'],
    'Plumbing': ['Pipe Leakage', 'Tap Repair', 'Blockage'],
    'Electrical': ['Switch Repair', 'Fan Installation', 'Wiring']
};

export function ServiceRegistrationForm({ userEmail, userName, onSubmit }: ServiceRegistrationFormProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        userId: userEmail, // Using email as ID for simple auth linking
        email: userEmail,
        personalDetails: {
            name: userName,
            phone: '',
        },
        serviceCategory: '',
        services: [] as string[],
        description: '',
        experience: 0,
        serviceArea: '',
        documents: [] as { type: string, url: string }[]
    });

    const handleCategoryChange = (cat: string) => {
        setFormData(prev => ({
            ...prev,
            serviceCategory: cat,
            services: [] // Reset specific services
        }));
    };

    const toggleService = (service: string) => {
        setFormData(prev => {
            const current = prev.services;
            if (current.includes(service)) {
                return { ...prev, services: current.filter(s => s !== service) };
            } else {
                return { ...prev, services: [...current, service] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Become a Service Provider</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Personal Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Personal Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Name</label>
                            <input
                                type="text"
                                value={formData.personalDetails.name}
                                onChange={e => setFormData({ ...formData, personalDetails: { ...formData.personalDetails, name: e.target.value } })}
                                className="w-full p-2 border rounded-lg bg-gray-50"
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                className="w-full p-2 border rounded-lg bg-gray-50"
                                disabled
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                required
                                value={formData.personalDetails.phone}
                                onChange={e => setFormData({ ...formData, personalDetails: { ...formData.personalDetails, phone: e.target.value } })}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Service Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Service Profiling</h3>

                    <div>
                        <label className="block text-sm text-gray-600 mb-2">Service Category</label>
                        <select
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                            value={formData.serviceCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            required
                        >
                            <option value="">Select a Category</option>
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    {formData.serviceCategory && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm text-gray-600 mb-2">Specific Services (Select Multiple)</label>
                            <div className="grid grid-cols-2 gap-2">
                                {SPECIFIC_SERVICES[formData.serviceCategory]?.map(service => (
                                    <label key={service} className={`
                                        flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
                                        ${formData.services.includes(service) ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-200 hover:border-gray-400'}
                                    `}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={formData.services.includes(service)}
                                            onChange={() => toggleService(service)}
                                        />
                                        <div className={`w-4 h-4 rounded-full border border-current flex items-center justify-center`}>
                                            {formData.services.includes(service) && <div className="w-2 h-2 bg-current rounded-full" />}
                                        </div>
                                        <span className="text-sm font-medium">{service}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Experience (Years)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.experience}
                                onChange={e => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Service Area / City</label>
                            <input
                                type="text"
                                required
                                value={formData.serviceArea}
                                onChange={e => setFormData({ ...formData, serviceArea: e.target.value })}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                                placeholder="e.g. New York, Mumbai"
                            />
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Documents - Mock Upload */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">KYC Documents</h3>
                    <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                        <Upload size={32} className="mb-2" />
                        <p className="text-sm font-medium">Click to upload ID Proof & Certificates</p>
                        <p className="text-xs text-gray-400 mt-1">(Files will be mocked for demo)</p>
                    </div>
                    <div className="text-xs text-blue-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        <span>Mock Mode: Files are not actually uploaded in this demo.</span>
                    </div>
                </div>

                <Button className="w-full py-4 text-lg mt-8">
                    Submit Application
                </Button>

            </form>
        </div>
    );
}
