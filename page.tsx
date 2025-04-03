"use client";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import {socket} from "@/app/socket"
import { useEffect } from "react";
import { io } from "socket.io-client";
import { Socket } from "socket.io";
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
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id:"1",name: 'Cold Boost', price: 40 },
    { id:"2",name: 'Bun Butter jam ', price: 40 },
    { id:"3",name: 'Palkova bun', price: 30 },
    { id:"4",name: 'Sarbath', price: 50 },
    {id:"5", name: 'Watermelon juice ', price: 40 },
    {id:"6", name: 'Creamy Fudge', price: 40 },
    { id:"7",name: 'Bread Omelete', price: 40 },
    { id:"8",name: 'Jigarthanda', price: 40 },
    { id:"9",name: 'Ice Cookies ', price: 40 },
  ]);
  const [orderedItems, setOrderedItems] = useState<OrderItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [ordererName, setOrdererName] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [orderQueue, setOrderQueue] = useState<QueueOrder[]>([]);
  
  useEffect(() => {
    // Initialize Socket.io connection
   if(socket?.connected){
    onConnect();
   }

    // Listen for order queue updates
    newSocket.on('orderQueueUpdate', (queue: QueueOrder[]) => {
      setOrderQueue(queue);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);


  const handleOrder = (menuItem: MenuItem) => {
    if (!ordererName) {
      alert("Please enter your name first");
      return;
    }

    const existingOrder = orderedItems.find(item => 
      item.id === menuItem.id && item.orderedBy === ordererName
    );

    if (existingOrder) {
      setOrderedItems(orderedItems.map(item => 
        item.id === menuItem.id && item.orderedBy === ordererName
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newOrder: OrderItem = {
        ...menuItem,
        quantity: 1,
        orderedBy: ordererName
      };
      setOrderedItems([...orderedItems, newOrder]);
    }

    setTotalPrice(totalPrice + menuItem.price);
  };

  const handleRemove = (orderItem: OrderItem) => {
    if (orderItem.quantity > 1) {
      setOrderedItems(orderedItems.map(item => 
        item.id === orderItem.id && item.orderedBy === orderItem.orderedBy
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setOrderedItems(orderedItems.filter(item => 
        !(item.id === orderItem.id && item.orderedBy === orderItem.orderedBy)
      ));
    }
    setTotalPrice(totalPrice - orderItem.price);
  };
  const handlePlaceOrder = () => {
    if (!socket || orderedItems.length === 0) return;

    const orderData = {
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

  const handleMarkOrderDone = (orderId: string) => {
    if (!socket) return;
    socket.emit('markOrderDone', { orderId });
  };



  return (
    <div>
      <Layout>
        <div className="flex flex-col items-center justify-center mb-6">
          <h1 className="text-2xl font-bold">Restaurant Order System</h1>
        </div>

        <div className="flex">
          {/* Menu Section */}
          <div className="w-1/2 p-4 flex flex-col">
            <div className="text-xl font-bold mb-4">Menu</div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Your Name"
                value={ordererName}
                onChange={(e) => setOrdererName(e.target.value)}
                className="border p-2 mb-2 w-full"
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              {menuItems.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3 border rounded flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-2">Rs{item.price.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => handleOrder(item)}
                    className="px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white"
                  >
                    Add to Order
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Ordered Items Section */}
          <div className="w-1/2 p-4">
            <div className="text-xl font-bold mb-4">
              {ordererName ? `${ordererName}'s Order` : 'Current Order'}
            </div>
            
            {orderedItems.length === 0 ? (
              <p className="text-gray-500">No items ordered yet</p>
            ) : (
              <div className="space-y-3">
                {orderedItems.map((item, index) => (
                  <div key={index} className="p-3 border rounded flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        {item.name} 
                        <span className="ml-2 text-sm font-normal">
                          (x{item.quantity})
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Rs{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(item)}
                      className="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
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
                <div>
                  <button className="px-4 py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200 w-full justify-start">
                    Place Order
                  </button>
                  </div>
                  <div className="mt-6 border-t pt-4">
  <h2 className="text-xl font-bold mb-3">Order Queue</h2>
  
  {orderedItems.length === 0 ? (
    <p className="text-gray-500 py-4 text-center">No orders in queue</p>
  ) : (
    <div className="space-y-2">
      {orderedItems.map((item, index) => (
        <div 
          key={`Rs{item.id}-Rs{index}`} 
          className="flex justify-between items-center p-2 border-b"
        >
          <div>
            <span className="font-medium">{item.name}</span>
            <span className="ml-2 text-gray-600">(x{item.quantity})</span>
          </div>
          <button
            onClick={() => handleRemove(item)}
            className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
          >
            Remove
          </button>
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