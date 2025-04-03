"use client";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { io, Socket } from "socket.io-client";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  orderedBy: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

interface QueueOrder {
  orderId: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  orderedBy: string;
  totalPrice: number;
  status: 'pending' | 'completed';
}

export default function Home() {
  const [menuItems] = useState<MenuItem[]>([
    { id: "1", name: 'Chicn chip', price: 110 },
    { id: "2", name: 'Eggy brot ', price: 45 },
    { id: "3", name: 'jam Bun-wich', price: 40 },
    { id: "4", name: 'palk-o-bun', price: 45 },
    { id: "5", name: 'Melon bites', price: 20 },
    { id: "6", name: 'Creamy Fudge', price: 110 },
    { id: "7", name: 'Sarbath', price: 40 },
    { id: "8", name: 'Rosebath', price: 50 },
    { id: "9", name: 'Melon burst ', price: 40 },
    { id: "10", name: 'Jigarshake ', price: 45 },
    { id: "11", name: 'Strawberry ice-cookies', price: 30 },
    { id: "12", name: 'Black-current ice-cookies', price: 30 },
    { id: "13", name: 'Choco ice-cookies', price: 30 },
    { id: "14", name: 'Trium ice-cookies ', price: 75 }
  ]);
  
  
  const [orderedItems, setOrderedItems] = useState<OrderItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [ordererName, setOrdererName] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [orderQueue, setOrderQueue] = useState<QueueOrder[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    
    const socketInstance = io({
      path: '/api/socket.io',
      transports: ['websocket'],
      addTrailingSlash: false
    });

    setSocket(socketInstance);

    const onConnect = () => {
      setIsConnected(true);
      console.log('Connected to socket server');
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log('Disconnected from socket server');
    };

    const onOrderQueueUpdate = (queue: QueueOrder[]) => {
      setOrderQueue(queue);
    };

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);
    socketInstance.on('orderQueueUpdate', onOrderQueueUpdate);

    socketInstance.connect();

    return () => {
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
      socketInstance.off('orderQueueUpdate', onOrderQueueUpdate);
      socketInstance.disconnect();
    };
  }, []);

  const handleOrder = (menuItem: MenuItem) => {
    if (!ordererName) {
      alert("Please enter your name first");
      return;
    }

    setOrderedItems(prevItems => {
      const existingOrder = prevItems.find(item => 
        item.id === menuItem.id && item.orderedBy === ordererName
      );

      if (existingOrder) {
        return prevItems.map(item => 
          item.id === menuItem.id && item.orderedBy === ordererName
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, {
          ...menuItem,
          quantity: 1,
          orderedBy: ordererName
        }];
      }
    });

    setTotalPrice(prevTotal => prevTotal + menuItem.price);
  };

  const handleRemove = (orderItem: OrderItem) => {
    setOrderedItems(prevItems => {
      if (orderItem.quantity > 1) {
        return prevItems.map(item => 
          item.id === orderItem.id && item.orderedBy === orderItem.orderedBy
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prevItems.filter(item => 
          !(item.id === orderItem.id && item.orderedBy === orderItem.orderedBy)
        );
      }
    });

    setTotalPrice(prevTotal => prevTotal - orderItem.price);
  };

  const handlePlaceOrder = () => {
    if (!socket || !isConnected || orderedItems.length === 0) {
      alert(isConnected ? "No items to order" : "Not connected to server");
      return;
    }
alert("pressed placed ")
    const orderData: QueueOrder = {
      orderId: Date.now().toString(),
      items: orderedItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      orderedBy: ordererName,
      totalPrice: totalPrice,
      status: 'pending'
    };
    

    socket.emit('placeOrder', orderData);
    setOrderedItems([]);
    setTotalPrice(0);
  };

  const handleMarkOrderDone = (orderId: string, orderedBy: string) => {
    if (!socket || !isConnected) return;
    
    socket.emit('markOrderDone', { 
      orderId,
      customerData: {
        name: orderedBy
        
      }
    });
  };

  return (
    <div>
      <Layout>
        <div className="flex flex-col items-center justify-center mb-6">
          <h1 className="text-2xl font-bold">Restaurant Order System</h1>
          <div className="text-sm mt-2">
            Connection: 
            <span className={`ml-2 px-2 py-1 rounded ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Menu Section */}
          <div className="w-full md:w-1/2 p-4">
            <div className="text-xl font-bold mb-4">Menu</div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Your Name"
                value={ordererName}
                onChange={(e) => setOrdererName(e.target.value)}
                className="border p-2 mb-2 w-full rounded"
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              {menuItems.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3 border rounded flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-2 text-gray-600">Rs{item.price.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => handleOrder(item)}
                    className="px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white transition-colors"
                  >
                    Add to Order
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Ordered Items Section */}
          <div className="w-full md:w-1/2 p-4">
            <div className="text-xl font-bold mb-4">
              {ordererName ? `${ordererName}'s Order` : 'Current Order'}
            </div>
            
            {orderedItems.length === 0 ? (
              <p className="text-gray-500 p-4 bg-gray-50 rounded">No items ordered yet</p>
            ) : (
              <div className="space-y-3">
                {orderedItems.map((item, index) => (
                  <div key={index} className="p-3 border rounded flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="font-medium">
                        {item.name} 
                        <span className="ml-2 text-sm font-normal text-gray-600">
                          (x{item.quantity})
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Rs{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(item)}
                      className="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <div className="font-bold">
                    Total Price: Rs{totalPrice.toFixed(2)}
                  </div>
                </div>
                
                <button
                  onClick={handlePlaceOrder}
                  disabled={!isConnected || orderedItems.length === 0}
                  className={`w-full px-4 py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200 ${
                    (!isConnected || orderedItems.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Place Order
                </button>
                
                <div className="mt-6 border-t pt-4">
                  <h2 className="text-xl font-bold mb-3">Order Queue</h2>
                  
                  {orderQueue.length === 0 ? (
                    <p className="text-gray-500 py-4 text-center bg-gray-50 rounded">No orders in queue</p>
                  ) : (
                    <div className="space-y-3">
                      {orderQueue.map((order) => (
                        <div key={order.orderId} className="p-3 border rounded-lg bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold">{order.orderedBy}</h3>
                              <div className="mt-2 space-y-1">
                                {order.items.map((item, i) => (
                                  <div key={i} className="flex justify-between text-sm">
                                    <span>
                                      {item.name} × {item.quantity}
                                    </span>
                                    <span>Rs{(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2 font-bold border-t pt-2">
                                Total: Rs{order.totalPrice.toFixed(2)}
                              </div>
                            </div>
                            <button
                              onClick={() => handleMarkOrderDone(order.orderId,order.orderedBy)}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                              disabled={!isConnected}
                            >
                              Mark Done
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </div>
  );
}