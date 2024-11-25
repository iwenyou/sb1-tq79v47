import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2, Download } from 'lucide-react';
import { QuoteData } from '../services/quoteService';
import { getQuoteById, updateQuote } from '../services/quoteService';
import { getProducts, getMaterials } from '../services/catalogService';
import { getPresetValues } from '../services/presetService';
import { Product, Material } from '../types/catalog';

export function QuoteView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [taxRate, setTaxRate] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState<'discount' | 'surcharge'>('discount');
  const [adjustmentPercentage, setAdjustmentPercentage] = useState(0);

  useEffect(() => {
    if (id) {
      const quoteData = getQuoteById(id);
      if (quoteData) {
        setQuote(quoteData);
        setAdjustmentType(quoteData.adjustmentType || 'discount');
        setAdjustmentPercentage(quoteData.adjustmentPercentage || 0);
      } else {
        navigate('/quotes');
      }
      setProducts(getProducts());
      setMaterials(getMaterials());
      const presetValues = getPresetValues();
      setTaxRate(presetValues.taxRate / 100); // Convert percentage to decimal
    }
  }, [id, navigate]);

  if (!quote) return null;

  const getProductName = (productId?: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Custom Product';
  };

  const getMaterialName = (materialId?: string) => {
    const material = materials.find(m => m.id === materialId);
    return material?.name || 'Default';
  };

  const calculateSubtotal = () => {
    return quote.spaces.reduce((sum, space) => 
      sum + space.items.reduce((itemSum, item) => itemSum + item.price, 0), 
      0
    );
  };

  const handleAdjustment = () => {
    if (!quote) return;

    const subtotal = calculateSubtotal();
    const multiplier = adjustmentType === 'discount' 
      ? (100 - adjustmentPercentage) / 100 
      : (100 + adjustmentPercentage) / 100;
    const adjustedSubtotal = subtotal * multiplier;
    const tax = adjustedSubtotal * taxRate;
    const total = adjustedSubtotal + tax;

    const updatedQuote = updateQuote(quote.id!, {
      ...quote,
      adjustmentType,
      adjustmentPercentage,
      adjustedTotal: adjustedSubtotal,
      total
    });
    setQuote(updatedQuote);
  };

  const subtotal = calculateSubtotal();
  const adjustedSubtotal = quote.adjustedTotal || subtotal;
  const tax = adjustedSubtotal * taxRate;
  const total = adjustedSubtotal + tax;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quote Details</h1>
          <p className="mt-2 text-gray-600">
            View quote information and details
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/quotes/${id}/edit`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Quote
          </button>
          <button
            onClick={() => {/* Download PDF */}}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Client Information</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Client Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{quote.clientName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{quote.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{quote.phone}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Project Details</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Project Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{quote.projectName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Installation Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                    {quote.installationAddress}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {quote.spaces.map((space) => (
          <div key={space.id} className="border-b border-gray-200">
            <div className="p-4 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">{space.name}</h3>
            </div>
            <div className="p-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Width</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Height</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Depth</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {space.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        {getProductName(item.productId)}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        {getMaterialName(item.material)}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        {item.width}"
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        {item.height}"
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        {item.depth}"
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900 text-right">
                        ${item.price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="w-64">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Price Adjustment
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={adjustmentType}
                    onChange={(e) =>
                      setAdjustmentType(e.target.value as 'discount' | 'surcharge')
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="discount">Discount</option>
                    <option value="surcharge">Surcharge</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Percentage
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={adjustmentPercentage}
                      onChange={(e) =>
                        setAdjustmentPercentage(Number(e.target.value))
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <span className="ml-2">%</span>
                  </div>
                </div>
                <button
                  onClick={handleAdjustment}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Apply Adjustment
                </button>
              </div>
            </div>

            <div className="w-64">
              <dl className="space-y-3">
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Subtotal</dt>
                  <dd className="text-gray-900">${subtotal.toFixed(2)}</dd>
                </div>
                {quote.adjustmentType && (
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-500">
                      {quote.adjustmentType === 'discount' ? 'Discount' : 'Surcharge'}{' '}
                      ({quote.adjustmentPercentage}%)
                    </dt>
                    <dd className="text-gray-900">
                      {quote.adjustmentType === 'discount' ? '-' : '+'}$
                      {Math.abs(subtotal - adjustedSubtotal).toFixed(2)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Tax ({(taxRate * 100).toFixed(1)}%)</dt>
                  <dd className="text-gray-900">${tax.toFixed(2)}</dd>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <dt className="text-base font-medium text-gray-900">Total</dt>
                  <dd className="text-base font-medium text-indigo-600">
                    ${total.toFixed(2)}
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