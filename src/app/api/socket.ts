import { Server } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import type { NextApiResponseWithSocket } from '@/types/next-socket';

const prisma = new PrismaClient();


interface PurchaseData {
  customerId: number;
  productIds: number[];
  amount: number;
}

interface PendingOrder extends PurchaseData {
  orderId: string;
  createdAt: Date;
  status: 'pending' | 'completed';
}

const generateOrderId = (): string => {
   
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }

export const config = {
  api: {
    bodyParser: false
  }
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io server');

    const io = new Server(res.socket.server, {
      path: '/api/socket.io',
      addTrailingSlash: false
    });

    res.socket.server.io = io;

    const pendingOrders = new Map<string, PendingOrder>();

    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on('newPurchase', (purchaseData: PurchaseData) => {
        try {
          const orderId = generateOrderId();
          const order: PendingOrder = {
            ...purchaseData,
            orderId,
            createdAt: new Date(),
            status: 'pending'
          };
          
          pendingOrders.set(orderId, order);
          
          io.emit('newPendingOrder', order);
        } catch (err) {
          console.error('Order creation error:', err);
          socket.emit('error', 'Failed to create order');
        }
      });

      socket.on('markOrderDone', async (orderId: string) => {
        try {
          const order = pendingOrders.get(orderId);
          if (!order) {
            throw new Error(`Order ${orderId} not found`);
          }

          const [updatedCustomer, updatedProducts] = await prisma.$transaction([
            prisma.customer.update({
              where: { id: order.customerId as number }, // Explicit type
              data: {
                purchased: {
                  connect: order.productIds.map((id: number) => ({ id })) // Explicit type
                },
                amount: { increment: order.amount }
              },
              include: { purchased: true }
            }),
            prisma.products.findMany({
              where: { id: { in: order.productIds as number[] } }, // Explicit type
              include: { purchased: true }
            })
          ]);

          pendingOrders.delete(orderId);
          
          io.emit('orderCompleted', {
            orderId,
            customer: updatedCustomer,
            products: updatedProducts
          });
          
        } catch (err) {
          console.error('Order completion error:', err);
          socket.emit('error', 'Failed to complete order');
        }
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }
  res.status(200).send('Socket.io initialized');
}