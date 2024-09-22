import prisma from '@/prisma';
import { HttpException } from '@/errors/httpException';
import { HttpStatus } from '@/types/error';
import { Prisma, OrderStatus } from '@prisma/client';
import { buildOrderSearchQuery } from './orderSearchQuery';

class OrderQuery {
    public async getFinishedOrders(
        customerId: number, 
        fromDate?: Date, 
        toDate?: Date, 
        search?: string, 
        page?: number, 
        pageSize?: number
      ): Promise<any> {
        const finishedStatuses = [OrderStatus.DIKONFIRMASI, OrderStatus.DIBATALKAN];
      
        try {
          const whereCondition: Prisma.OrderWhereInput = {
            customerId,
            orderStatus: {
              in: finishedStatuses,
            },
            ...buildOrderSearchQuery(search), // Apply search query
          };
    
          if (fromDate && toDate) {
            whereCondition.createdAt = {
              gte: fromDate,
              lte: toDate,
            };
          }
    
          const take = pageSize || 10;
          const skip = page ? (page - 1) * take : 0;
      
          const orders = await prisma.order.findMany({
            where: whereCondition,
            include: {
              orderItems: true,
              payment: true,
              shipping: true,
              orderStatusUpdates: true,
            },
            skip,
            take,
            orderBy: {
              createdAt: 'desc', 
            },
          });
      
          if (!orders.length) {
            throw new HttpException(404, 'No finished orders found for this user');
          }
      
          return orders;
        } catch (err) {
          throw new HttpException(500, 'Failed to retrieve finished orders');
        }
      }
      public async getUnfinishedOrders(
        customerId: number, 
        fromDate?: Date, 
        toDate?: Date, 
        search?: string, 
        page?: number, 
        pageSize?: number
      ): Promise<any> {
        const unfinishedStatuses = [
          OrderStatus.MENUNGGU_PEMBAYARAN,
          OrderStatus.MENUNGGU_KONFIRMASI_PEMBAYARAN,
          OrderStatus.DIPROSES,
          OrderStatus.DIKIRIM,
        ];
      
        try {
          const whereCondition: Prisma.OrderWhereInput = {
            customerId,
            orderStatus: {
              in: unfinishedStatuses,
            },
            ...buildOrderSearchQuery(search), // Apply search query
          };

          if (fromDate && toDate) {
            whereCondition.createdAt = {
              gte: fromDate,
              lte: toDate,
            };
          }

          const take = pageSize || 10;
          const skip = page ? (page - 1) * take : 0;
      
          const orders = await prisma.order.findMany({
            where: whereCondition,
            include: {
              orderItems: true,
              payment: true,
              shipping: true,
              orderStatusUpdates: true,
            },
            skip,
            take,
            orderBy: {
              createdAt: 'desc', // Orders will be returned in descending order of creation date
            },
          });
      
          if (!orders.length) {
            throw new HttpException(404, 'No finished orders found for this user');
          }
      
          return orders;
        } catch (err) {
          throw new HttpException(500, 'Failed to retrieve finished orders');
        }
      }
}

export default new OrderQuery();