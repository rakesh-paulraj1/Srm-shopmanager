import { Server } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import type { NextApiResponseWithSocket } from '@/types/next-socket';

interface CompleteOrderData {
  orderId: string;
  customerData: {
    name: string;
  };
}
const prisma = new PrismaClient();


interface PurchaseData {
  customerId: number;
  customername:String;
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

      socket.on('markOrderDone', async (completeData: CompleteOrderData) => {
        try {
          const { orderId, customerData } = completeData;
          const order = pendingOrders.get(orderId);
          
          if (!order) {
            throw new Error(`Order ${orderId} not found`);
          }
      
          
          const [customer, updatedProducts] = await prisma.$transaction([
          
            prisma.customer.create({
              data: {
                name: customerData.name,
                purchased: {
                  connect: order.productIds.map(id => ({ id }))
                },
                amount: order.amount
              },
              include: {
                purchased: true
              }
            }),
            
            // Get updated product info
            prisma.products.findMany({
              where: { id: { in: order.productIds } },
              include: { purchased: true }
            })
          ]);
      
          // Remove from pending orders
          pendingOrders.delete(orderId);
          
          // Broadcast completion
          io.emit('orderCompleted', {
            orderId,
            customer,
            products: updatedProducts
          });
          
        } catch (err) {
          console.error('Order completion error:', err);
          socket.emit('orderError', {
            orderId: completeData.orderId,
            message: err instanceof Error ? err.message : 'Completion failed'
          });
        }
      });
    });
  }
  res.status(200).send('Socket.io initialized');
}