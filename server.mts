import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient } from '@prisma/client';
const dev = process.env.NODE_ENV !== "production";
const hostname =process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT||"3000",10);

  interface QueueOrder {
    items: {
        id: string;
      name: string;
      quantity: number;
      price: number;
    }[];
    orderedBy: string;
    totalPrice: number;
    status: 'pending' | 'completed';
  }
  
interface PendingOrder extends QueueOrder {
    orderId: string;
    createdAt: Date;
    status: 'pending' | 'completed';
  }
const prisma = new PrismaClient();

  const generateOrderId = (): string => {
   
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
const pendingOrders = new Map<string, PendingOrder>();
app.prepare().then(()=>{
    const httpServer = createServer(handler);
    const io = new Server(httpServer);
    io.on("connection", (socket) => {
        console.log("New client connected", socket.id);
        
        
        socket.on("join", (room) => {
            socket.join(room);
            console.log(`${socket.id} joined room ${room}`);
        })
        
        socket.on("newpurchase", (room,purchaseData: QueueOrder)=>{
            try {
                const orderId = generateOrderId();
                
                // Create the order in QueueOrder format
                const order: QueueOrder = {
                  items: purchaseData.items.map(item => ({
                    id: item.id, 
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                  })),
                  orderedBy: purchaseData.orderedBy , // Provide a default if needed
                  totalPrice: purchaseData.totalPrice, // Assuming amount is the total price
                  status: 'pending'
                };
              
                // If you still need to maintain the PendingOrder type separately
                const pendingOrder: PendingOrder = {
                  ...order, // Spread the QueueOrder properties
                  orderId,
                  createdAt: new Date()
                };
              // console.log('Pending order purchase:', pendingOrder);
                pendingOrders.set(orderId, pendingOrder);
                socket.to(room).emit('newpurchaseget', pendingOrder);
              } catch (err) {
                console.error('Order creation error:', err);
                socket.emit('error', 'Failed to create order');
              }
        }
    )
    socket.on('getPendingOrders', (room) => {
        const ordersArray = Array.from(pendingOrders.values());
        // console.log('Pending orders:', ordersArray);
        socket.to(room).emit('pendingOrders', ordersArray);

      });
    
   // Server-side handler
socket.on('markOrderDone', async (room, completeData: { orderId: string }) => {
  try {
      const { orderId } = completeData;
      const order = pendingOrders.get(orderId);
      
      if (!order) {
          throw new Error(`Order ${orderId} not found`);
      }
      
      await prisma.customer.create({
          data: {
              name: order.orderedBy, // Use orderedBy from the existing order
              purchased: JSON.stringify(order.items),
              amount: order.totalPrice
          }
      });
      
      pendingOrders.delete(orderId);
      const updatedOrders = Array.from(pendingOrders.values());
      socket.to(room).emit('pendingOrders', updatedOrders);
      
  } catch (err) {
      console.error('Order completion error:', err);
      socket.to(room).emit('orderError', {
          orderId: completeData.orderId,
          message: err instanceof Error ? err.message : 'Completion failed'
      });
  }
});
        
        socket.on("disconnect", () => {
            console.log("Client disconnected", socket.id);});

    });

    httpServer.listen(port, () => {
        console.log(`serever is running on http://${hostname}:${port}`);
    });
})
