import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { MaterialList } from './Materials/components/MaterialList';
import { ServiceList } from './Materials/components/ServiceList';

type MaterialTab = 'items' | 'service' | 'category' | 'unit' | 'warehouses' | 'variants';

export function Materials() {
  const [activeTab, setActiveTab] = useState<MaterialTab>('items');

  const tabs = [
    { id: 'items', label: 'Items' },
    { id: 'service', label: 'Service' },
    { id: 'category', label: 'Category' },
    { id: 'unit', label: 'Unit' },
    { id: 'warehouses', label: 'Warehouses' },
    { id: 'variants', label: 'Inventory Variants' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Materials & Services</h1>
        <p className="text-slate-500">Manage your inventory items, services, and configurations.</p>
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="flex gap-8 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as MaterialTab)}
              className={cn(
                "pb-4 text-sm font-medium transition-colors relative whitespace-nowrap",
                activeTab === tab.id 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'items' && <MaterialList />}
        {activeTab === 'service' && <ServiceList />}
        
        {/* Placeholder for other tabs - they can be modularized later */}
        {['category', 'unit', 'warehouses', 'variants'].includes(activeTab) && (
          <div className="bg-white border rounded-lg p-12 text-center space-y-4">
            <p className="text-slate-500 italic">This module ({activeTab}) is being modularized.</p>
            <p className="text-sm text-slate-400">Please refer to the original implementation or wait for the next update.</p>
          </div>
        )}
      </div>
    </div>
  );
}
