'use client';

import React, { useState } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Order } from '@/types/paymentTypes';

const OrderActions: React.FC<{ order: Order; userId: string; orderId: string; }> = ({ order, userId, orderId }) => {
  const [isLoading, setIsLoading] = useState(false);

  const cancelOrder = async () => {
    if (!orderId) return;

    setIsLoading(true);

    try {
      await axiosInstance().post(`/orders/cancel`, {
        orderId: parseInt(orderId, 10),
        userId: parseInt(userId, 10),
      });

      toast({
        variant: 'success',
        title: 'Order Cancelled',
        description: 'Your order has been successfully cancelled.',
      });

      // Reload the page after cancellation
      window.location.reload();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to cancel order',
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmShipping = async () => {
    if (!orderId) return;

    setIsLoading(true);

    try {
      await axiosInstance().post(`/shipping/confirm`, {
        orderId: parseInt(orderId, 10),
        userId: parseInt(userId, 10),
      });

      toast({
        variant: 'success',
        title: 'Shipping Confirmed',
        description: 'The shipping has been successfully confirmed.',
      });

      // Reload the page after confirmation
      window.location.reload();
    } catch (error) {
      console.error('Error confirming shipping:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to confirm shipping',
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6">
      {/* Render the Cancel Order button only if the status is MENUNGGU_PEMBAYARAN */}
      {order.orderStatus === 'MENUNGGU_PEMBAYARAN' && (
        <div className="mt-4">
          <Button
            variant="destructive"
            onClick={cancelOrder}
            disabled={isLoading}
          >
            Batalkan Pesanan
          </Button>
        </div>
      )}

      {/* Render the Confirm Shipping button only if the status is DIKIRIM */}
      {order.orderStatus === 'DIKIRIM' && (
        <div className="mt-4">
          <Button
            onClick={confirmShipping}
            disabled={isLoading}
          >
            Konfirmasi Pengiriman
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderActions;