// types/next-socket.d.ts
import { Server as HTTPServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { NextApiResponse } from 'next';

declare module 'http' {
  interface Server {
    io?: IOServer;
  }
}

export interface NextApiResponseWithSocket extends NextApiResponse {
  socket: {
    server: HTTPServer;
  };
}