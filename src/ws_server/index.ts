import { WebSocketServer } from 'ws';
import { httpServer } from '../http_server';
import { handleWebSocketConnection } from './webSocket/webSocketServer';

const PORT = Number(process.env.PORT ?? 3000);

const startServers = () => {
  // HTTP Server
  httpServer
    .listen(PORT, () => {
      console.log(`Static http server running on port ${PORT}`);
    })
    .on('error', (err) => {
      console.error('HTTP server error:', err);
    });

  // WebSocket Server
  const wsServer = new WebSocketServer({ server: httpServer });

  wsServer.on('connection', (ws) => {
    console.log('WebSocket client connected');
        handleWebSocketConnection(ws);
  });

  process.on('SIGINT', () => {
    wsServer.close();
    httpServer.close(() => {
      console.log('Servers closed');
      process.exit(0);
    });
  });
};

startServers();