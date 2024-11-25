import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SpaceSection } from '../components/quote/SpaceSection';
import { Space, CabinetItem } from '../types/quote';
import { generateQuote, saveDraft } from '../services/quoteService';
import { getPresetValues } from '../services/presetService';

const defaultItem: Omit<CabinetItem, 'id'> = {
  width: 30,
  height: 30,
  depth: 24,
  price: 299.99,
};

interface FormData {
  clientName: string;
  email: string;
  phone: string;
  projectName: string;
  installationAddress: string;
  spaces: Space[];
}

const defaultFormData: FormData = {
  clientName: '',
  email: '',
  phone: '',
  projectName: '',
  installationAddress: '',
  spaces: [
    {
      id: crypto.randomUUID(),
      name: 'Space #1',
      items: [{
        id: crypto.randomUUID(),
        ...defaultItem,
      }],
    },
  ],
};

export function GenerateQuote() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(() => {
    const saved = localStorage.getItem('generateQuoteForm');
    return saved ? JSON.parse(saved) : defaultFormData;
  });
  const [taxRate, setTaxRate] = useState(0);

  useEffect(() => {
    const presetValues = getPresetValues();
    setTaxRate(presetValues.taxRate / 100);
  }, []);

  useEffect(() => {
    localStorage.setItem('generateQuoteForm', JSON.stringify(formData));
  }, [formData]);

  const handleAddSpace = () => {
    const newSpace: Space = {
      id: crypto.randomUUID(),
      name: `Space #${formData.spaces.length + 1}`,
      items: [{
        id: crypto.randomUUID(),
        ...defaultItem,
      }],
    };
    setFormData(prev => ({
      ...prev,
      spaces: [...prev.spaces, newSpace],
    }));
  };

  const handleUpdateSpace = (id: string, updates: Partial<Space>) => {
    setFormData(prev => ({
      ...prev,
      spaces: prev.spaces.map(space => 
        space.id === id ? { ...space, ...updates } : space
      ),
    }));
  };

  const handleDeleteSpace = (id: string) => {
    setFormData(prev => ({
      ...prev,
      spaces: prev.spaces.filter(space => space.id !== id),
    }));
  };

  const handleAddItem = (spaceId: string) => {
    const newItem: CabinetItem = {
      id: crypto.randomUUID(),
      ...defaultItem,
    };
    setFormData(prev => ({
      ...prev,
      spaces: prev.spaces.map(space =>
        space.id === spaceId
          ? { ...space, items: [...space.items, newItem] }
          : space
      ),
    }));
  };

  const handleUpdateItem = (spaceId: string, itemId: string, updates: Partial<CabinetItem>) => {
    setFormData(prev => ({
      ...prev,
      spaces: prev.spaces.map(space =>
        space.id === spaceId
          ? {
              ...space,
              items: space.items.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
              ),
            }
          : space
      ),
    }));
  };

  const handleDeleteItem = (spaceId: string, itemId: string) => {
    setFormData(prev => ({
      ...prev,
      spaces: prev.spaces.map(space =>
        space.id === spaceId
          ? { ...space, items: space.items.filter(item => item.id !== itemId) }
          : space
      ),
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.spaces.reduce(
      (sum, space) =>
        sum +
        space.items.reduce((itemSum, item) => itemSum + item.price, 0),
      0
    );
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return { subtotal, tax, total };
  };

  const handleGenerateQuote = () => {
    const totals = calculateTotals();
    const quote = generateQuote({
      ...formData,
      total: totals.total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    localStorage.removeItem('generateQuoteForm');
    navigate(`/quotes/${quote.id}/view`);
  };

  const handleSaveDraft = () => {
    const totals = calculateTotals();
    const draft = saveDraft({
      ...formData,
      total: totals.total,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    localStorage.removeItem('generateQuoteForm');
    navigate(`/quotes/${draft.id}/edit`);
  };

  const handleClearForm = () => {
    if (window.confirm('Are you sure you want to clear the form? This action cannot be undone.')) {
      setFormData(defaultFormData);
      localStorage.removeItem('generateQuoteForm');
    }
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Generate Quote</h1>
          <p className="mt-2 text-gray-600">Create a new quote for your client</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleClearForm}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Form
          </button>
          <button
            onClick={handleSaveDraft}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Save Draft
          </button>
          <button
            onClick={handleGenerateQuote}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Generate Quote
          </button>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Client Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Client Name
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Project Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Installation Address
                </label>
                <textarea
                  value={formData.installationAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, installationAddress: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {formData.spaces.map((space) => (
          <SpaceSection
            key={space.id}
            space={space}
            onUpdateSpace={handleUpdateSpace}
            onDeleteSpace={handleDeleteSpace}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleAddSpace}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Space
        </button>
      </div>

      <div className="mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-end">
            <div className="w-80">
              <dl className="space-y-3">
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Subtotal</dt>
                  <dd className="text-gray-900">${totals.subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Tax ({(taxRate * 100).toFixed(1)}%)</dt>
                  <dd className="text-gray-900">${totals.tax.toFixed(2)}</dd>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <dt className="text-base font-medium text-gray-900">Total</dt>
                  <dd className="text-base font-medium text-indigo-600">
                    ${totals.total.toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}