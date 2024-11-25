import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Mail } from 'lucide-react';
import { QuoteData } from '../services/quoteService';
import { getQuoteById } from '../services/quoteService';
import { getDemoQuote } from '../services/demoService';
import { getProducts, getMaterials } from '../services/catalogService';
import { getTemplateSettings } from '../services/templateService';
import { Product, Material } from '../types/catalog';
import { TemplateSettings } from '../types/template';

export function ClientQuoteView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [template, setTemplate] = useState<TemplateSettings>(getTemplateSettings());
  const styles = {
    fontFamily: template.layout.fontFamily,
    primaryColor: template.layout.primaryColor,
  };

  useEffect(() => {
    setProducts(getProducts());
    setMaterials(getMaterials());
    setTemplate(getTemplateSettings());

    if (id === 'demo') {
      setQuote(getDemoQuote());
    } else if (id) {
      const quoteData = getQuoteById(id);
      if (quoteData) {
        setQuote(quoteData);
      } else {
        navigate('/404');
      }
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

  const formatDimensions = (item: any) => {
    return `${item.height}"H x ${item.width}"W x ${item.depth}"D`;
  };

  const calculateSubtotal = () => {
    return quote.spaces.reduce((sum, space) => 
      sum + space.items.reduce((itemSum, item) => itemSum + item.price, 0), 
      0
    );
  };

  const subtotal = calculateSubtotal();
  const taxRate = 0.13; // This should come from preset values
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8" style={{ fontFamily: styles.fontFamily }}>
      {template.sections.header.enabled && (
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-start">
              {template.layout.showLogo && template.companyInfo.logo && (
                <img
                  src={template.companyInfo.logo}
                  alt={template.companyInfo.name}
                  className="h-16 w-auto"
                />
              )}
              <div className="text-right">
                <h1 className="text-2xl font-bold" style={{ color: styles.primaryColor }}>
                  {template.companyInfo.name}
                </h1>
                {template.layout.showCompanyInfo && (
                  <div className="mt-2 text-sm text-gray-600 whitespace-pre-line">
                    {template.companyInfo.address}
                    <br />
                    {template.companyInfo.phone}
                    <br />
                    {template.companyInfo.email}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto mt-8">
        {template.sections.clientInfo.enabled && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
            <div className="p-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Client Information</h2>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {quote.clientName}</p>
                    <p><strong>Email:</strong> {quote.email}</p>
                    <p><strong>Phone:</strong> {quote.phone}</p>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-4">Project Details</h2>
                  <div className="space-y-2 text-sm">
                    <p><strong>Project Name:</strong> {quote.projectName}</p>
                    <p><strong>Installation Address:</strong></p>
                    <p className="whitespace-pre-line">{quote.installationAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {template.sections.quoteDetails.enabled && quote.spaces.map((space) => (
          <div key={space.id} className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
            <div className="p-8">
              <h3 className="text-lg font-semibold mb-4">{space.name}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dimensions</th>
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
                          {formatDimensions(item)}
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
          </div>
        ))}

        {template.sections.totals.enabled && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-8">
              <div className="flex justify-end">
                <div className="w-64">
                  <dl className="space-y-4">
                    {template.sections.totals.showSubtotal && (
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-500">Subtotal</dt>
                        <dd className="text-gray-900">${subtotal.toFixed(2)}</dd>
                      </div>
                    )}
                    {template.sections.totals.showTax && (
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-500">Tax ({(taxRate * 100).toFixed(1)}%)</dt>
                        <dd className="text-gray-900">${tax.toFixed(2)}</dd>
                      </div>
                    )}
                    {template.sections.totals.showTotal && (
                      <div className="border-t border-gray-200 pt-4 flex justify-between">
                        <dt className="text-base font-medium text-gray-900">Total</dt>
                        <dd className="text-base font-medium" style={{ color: styles.primaryColor }}>
                          ${total.toFixed(2)}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {template.sections.footer.enabled && (
          <div className="mt-8 text-center text-sm text-gray-600">
            <p className="mb-2">{template.sections.footer.notes}</p>
            <p>{template.sections.footer.terms}</p>
          </div>
        )}

        {template.layout.showContactButtons && (
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </button>
            <a
              href={`mailto:${template.companyInfo.email}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Us
            </a>
          </div>
        )}
      </div>
    </div>
  );
}