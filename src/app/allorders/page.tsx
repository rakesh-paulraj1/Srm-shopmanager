"use client"
import React from 'react'
import { Layout } from '@/components/Layout'
import { socket } from '../socket'
import { useEffect } from 'react'
const Page = () => {
  // const roomid = 1; // Hardcoded room ID

  useEffect(() => {
    // socket.emit('joinRoom', roomId); // Connect to room ID 1
    socket.on('user_joined',(roomid)=>{
      console.log(`User joined room ${roomid}`);
    });
  },[]);
  return (
    <Layout>


    <div className='bg-white'>
      <div className='text-md text-blue-900'>
        All Order Details
      </div>
    </div>
    </Layout>
  )
}

export default Page