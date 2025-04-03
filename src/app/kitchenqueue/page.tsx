"use client";
import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { socket } from "../socket";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface QueueOrder {
  orderId: string;
  items: OrderItem[];
  orderedBy: string;
  totalPrice: number;
  status: "pending" | "completed";
  createdAt?: string;
}

const QueuePage = () => {
  const [orderQueue, setOrderQueue] = useState<QueueOrder[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log("Socket connection initialized");

    function onConnect() {
      setIsConnected(true);
      socket.emit("join", "room1");
      socket.emit("getPendingOrders", "room1");
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onOrderQueueUpdate(queue: unknown) {
      try {
        if (!Array.isArray(queue)) {
          throw new Error("Expected array but got " + typeof queue);
        }

        const validatedQueue = queue.map((order: any) => ({
          orderId: String(order.orderId || order.id || Date.now()),
          items: Array.isArray(order.items)
            ? order.items.map((item: any) => ({
                id: String(item.id || ""),
                name: item.name || "Unknown item",
                quantity: Number(item.quantity) || 0,
                price: Number(item.price) || 0,
              }))
            : [],
          orderedBy: order.orderedBy || "Unknown customer",
          totalPrice: Number(order.totalPrice) || 0,
          status: order.status === "completed" ? "completed" : "pending",
          createdAt: order.createdAt || new Date().toISOString(),
        }));

        console.log("Validated order queue:", validatedQueue);
        setOrderQueue(validatedQueue);
      } catch (err) {
        console.error("Error processing queue:", err);
      }
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("pendingOrders", onOrderQueueUpdate); // Fixed event name

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("pendingOrders", onOrderQueueUpdate);
    };
  }, []);

  const handleMarkDone = (orderId: string) => {
    socket.emit("markOrderDone", "room1", { orderId });
  };

  return (
    <Layout>
      <div className="bg-white p-6">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">Order Queue</h1>
        <div className="text-sm mt-2">
          Status: {isConnected ? "connected" : "disconnected"}
        </div>
        {orderQueue.length === 0 ? (
          <p className="text-gray-500">No orders in queue</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orderQueue.map((order) => (
                  <tr key={order.orderId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.orderId.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderedBy}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <ul className="list-disc pl-5">
                        {order.items.map((item, index) => (
                          <li key={index}>
                            {item.name} × {item.quantity} (Rs.
                            {item.price * item.quantity})
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rs.{order.totalPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {order.status === "pending" && (
                        <button
                          onClick={() => handleMarkDone(order.orderId)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Mark Done
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default QueuePage;
