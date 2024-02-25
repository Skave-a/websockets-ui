import { createWebSocketStream, WebSocketServer } from 'ws';
import { httpServer } from '../http_server';

const PORT = Number(process.env.PORT ?? 3000);

interface Player {
  name: string;
  password: string;
}

interface RegistrationResponse {
  type: string;
  data: {
    name: string;
    index?: number;
    error: boolean;
    errorText: string;
  };
  id: number;
}

const players: Player[] = [];

const registerPlayer = (name: string, password: string) => {
  const existingPlayer = players.find(player => player.name === name);
  if (existingPlayer) {
    return JSON.stringify({ type: "reg", data: { name, error: true, errorText: "Player already exists" }, id: 0 });
  }

  const newPlayer: Player = { name, password };
  players.push(newPlayer);

  return  { type: "reg", data: JSON.stringify({ name, index: players.length - 1, error: false, errorText: "" }), id: 0 };
};

const startServers = () => {
  // HTTP Server
  httpServer.listen(PORT, () => {
    console.log(`Static http server running on port ${PORT}`);
  }).on('error', (err) => {
    console.error('HTTP server error:', err);
  });

  // WebSocket Server
  const wsServer = new WebSocketServer({ server: httpServer });

  wsServer.on('connection', (ws) => {
    // почему этот консоль не отображается
    console.log('WebSocket client connected');

    const wsStream = createWebSocketStream(ws, {
      decodeStrings: false,
      encoding: 'utf-8',
    });

    wsStream.on('data', async (data) => {
      // Обработка сообщений о регистрации и входе игрока
      try {
        const message = JSON.parse(data);
        if (message.type === "reg") {
          const dataParse = JSON.parse(message.data);
          const response = registerPlayer(dataParse.name, dataParse.password);
          wsStream.write(JSON.stringify(response));
        } 
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
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
