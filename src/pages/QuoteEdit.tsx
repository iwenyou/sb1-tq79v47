import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Save, ArrowLeft } from 'lucide-react';
import { SpaceSection } from '../components/quote/SpaceSection';
import { Space, CabinetItem } from '../types/quote';
import { getQuoteById, updateQuote, QuoteData } from '../services/quoteService';

const defaultItem: Omit<CabinetItem, 'id'> = {
  width: 30,
  height: 30,
  depth: 24,
  price: 299.99,
};

export function QuoteEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<QuoteData | null>(null);

  useEffect(() => {
    if (id) {
      const quoteData = getQuoteById(id);
      if (quoteData) {
        setQuote(quoteData);
      } else {
        navigate('/quotes');
      }
    }
  }, [id, navigate]);

  if (!quote) return null;

  const handleAddSpace = () => {
    const newSpace: Space = {
      id: crypto.randomUUID(),
      name: `Space #${quote.spaces.length + 1}`,
      items: [{
        id: crypto.randomUUID(),
        ...defaultItem,
      }],
    };
    const updatedQuote = {
      ...quote,
      spaces: [...quote.spaces, newSpace],
    };
    updateQuote(quote.id!, updatedQuote);
    setQuote(updatedQuote);
  };

  const handleUpdateSpace = (spaceId: string, updates: Partial<Space>) => {
    const updatedQuote = {
      ...quote,
      spaces: quote.spaces.map(space =>
        space.id === spaceId ? { ...space, ...updates } : space
      ),
    };
    updateQuote(quote.id!, updatedQuote);
    setQuote(updatedQuote);
  };

  const handleDeleteSpace = (spaceId: string) => {
    const updatedQuote = {
      ...quote,
      spaces: quote.spaces.filter(space => space.id !== spaceId),
    };
    updateQuote(quote.id!, updatedQuote);
    setQuote(updatedQuote);
  };

  const handleAddItem = (spaceId: string) => {
    const newItem: CabinetItem = {
      id: crypto.randomUUID(),
      ...defaultItem,
    };
    const updatedQuote = {
      ...quote,
      spaces: quote.spaces.map(space =>
        space.id === spaceId
          ? { ...space, items: [...space.items, newItem] }
          : space
      ),
    };
    updateQuote(quote.id!, updatedQuote);
    setQuote(updatedQuote);
  };

  const handleUpdateItem = (spaceId: string, itemId: string, updates: Partial<CabinetItem>) => {
    const updatedQuote = {
      ...quote,
      spaces: quote.spaces.map(space =>
        space.id === spaceId
          ? {
              ...space,
              items: space.items.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
              ),
            }
          : space
      ),
    };
    updateQuote(quote.id!, updatedQuote);
    setQuote(updatedQuote);
  };

  const handleDeleteItem = (spaceId: string, itemId: string) => {
    const updatedQuote = {
      ...quote,
      spaces: quote.spaces.map(space =>
        space.id === spaceId
          ? { ...space, items: space.items.filter(item => item.id !== itemId) }
          : space
      ),
    };
    updateQuote(quote.id!, updatedQuote);
    setQuote(updatedQuote);
  };

  const calculateTotals = () => {
    const subtotal = quote.spaces.reduce(
      (sum, space) =>
        sum +
        space.items.reduce((itemSum, item) => itemSum + item.price, 0),
      0
    );
    const taxRate = 0.13; // This should come from preset values
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return { subtotal, tax, total };
  };

  const handleSave = () => {
    try {
      const totals = calculateTotals();
      const updatedQuote = {
        ...quote,
        total: totals.total,
        updatedAt: new Date().toISOString(),
      };
      updateQuote(quote.id!, updatedQuote);
      navigate(`/quotes/${quote.id}/view`);
    } catch (error) {
      alert('Failed to save changes. Please try again.');
    }
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate('/quotes')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quotes
        </button>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Quote</h1>
          <p className="mt-2 text-gray-600">Update quote information and details</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/quotes/${quote.id}/view`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
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
                  value={quote.clientName}
                  onChange={(e) => setQuote({ ...quote, clientName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={quote.email}
                  onChange={(e) => setQuote({ ...quote, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  value={quote.phone}
                  onChange={(e) => setQuote({ ...quote, phone: e.target.value })}
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
                  value={quote.projectName}
                  onChange={(e) => setQuote({ ...quote, projectName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Installation Address
                </label>
                <textarea
                  value={quote.installationAddress}
                  onChange={(e) => setQuote({ ...quote, installationAddress: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {quote.spaces.map((space) => (
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
                  <dt className="text-gray-500">Tax (13%)</dt>
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