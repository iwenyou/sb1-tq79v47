import React from 'react';
import { Order } from '../../types/order';
import { ReceiptTemplate } from '../../types/order';
import { OrderItemsTable } from '../orders/OrderItemsTable';
import { OrderTotals } from '../orders/OrderTotals';

interface ReceiptPreviewProps {
  order: Order;
  template: ReceiptTemplate;
}

export function ReceiptPreview({ order, template }: ReceiptPreviewProps) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {template.businessInfo.name}
          </h1>
          <div className="mt-2 text-sm text-gray-600 whitespace-pre-line">
            {template.businessInfo.address}
            <br />
            {template.businessInfo.phone}
            <br />
            {template.businessInfo.email}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Receipt #{order.id.slice(0, 8)}</p>
          <p className="text-sm text-gray-600">
            Date: {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Bill To:</h2>
        <div className="text-sm text-gray-600">
          <p>{order.clientName}</p>
          <p>{order.email}</p>
          <p>{order.phone}</p>
          <p className="whitespace-pre-line">{order.installationAddress}</p>
        </div>
      </div>

      {/* Items */}
      <div className="mb-8">
        <OrderItemsTable items={order.items} />
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64">
          <OrderTotals
            subtotal={order.total}
            adjustmentType={order.adjustmentType}
            adjustmentPercentage={order.adjustmentPercentage}
            adjustedTotal={order.adjustedTotal}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-2">Terms & Conditions:</p>
          <p className="whitespace-pre-line">{template.footer.termsAndConditions}</p>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p className="whitespace-pre-line">{template.footer.notes}</p>
        </div>
      </div>
    </div>
  );
}