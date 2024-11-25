import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Order } from '../types/order';
import { getOrderById, updateOrder } from '../services/orderService';
import { OrderHeader } from '../components/orders/OrderHeader';
import { OrderItemsTable } from '../components/orders/OrderItemsTable';
import { OrderAdjustmentForm } from '../components/orders/OrderAdjustmentForm';
import { OrderTotals } from '../components/orders/OrderTotals';
import { ReceiptManager } from '../components/orders/ReceiptManager';
import { ClientInfo } from '../components/orders/ClientInfo';

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'discount' | 'surcharge'>('discount');
  const [adjustmentPercentage, setAdjustmentPercentage] = useState(0);

  useEffect(() => {
    if (id) {
      const orderData = getOrderById(id);
      if (orderData) {
        setOrder(orderData);
        setAdjustmentType(orderData.adjustmentType || 'discount');
        setAdjustmentPercentage(orderData.adjustmentPercentage || 0);
      } else {
        navigate('/orders');
      }
    }
  }, [id, navigate]);

  if (!order) return null;

  const handleStatusChange = (newStatus: string) => {
    if (order) {
      const updatedOrder = updateOrder(order.id, {
        status: newStatus as Order['status']
      });
      setOrder(updatedOrder);
    }
  };

  const handleAdjustment = () => {
    if (order) {
      const multiplier = adjustmentType === 'discount' 
        ? (100 - adjustmentPercentage) / 100 
        : (100 + adjustmentPercentage) / 100;
      const adjustedTotal = order.total * multiplier;

      const updatedOrder = updateOrder(order.id, {
        adjustmentType,
        adjustmentPercentage,
        adjustedTotal
      });
      setOrder(updatedOrder);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </button>
      </div>

      <OrderHeader 
        order={order} 
        onStatusChange={handleStatusChange} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Client Information */}
          <ClientInfo order={order} />

          {/* Order Items */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Order Items
              </h2>
              <OrderItemsTable items={order.items} />
            </div>
          </div>

          {/* Receipts */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <ReceiptManager order={order} onUpdate={setOrder} />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Price Adjustment */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Price Adjustment
              </h2>
              <OrderAdjustmentForm
                type={adjustmentType}
                percentage={adjustmentPercentage}
                onTypeChange={setAdjustmentType}
                onPercentageChange={setAdjustmentPercentage}
                onApply={handleAdjustment}
              />
            </div>
          </div>

          {/* Order Totals */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Order Summary
              </h2>
              <OrderTotals
                subtotal={order.total}
                adjustmentType={order.adjustmentType}
                adjustmentPercentage={order.adjustmentPercentage}
                adjustedTotal={order.adjustedTotal}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}