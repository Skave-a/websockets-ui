import { createWebSocketStream, WebSocketServer } from 'ws';
import { httpServer } from '../http_server';

const PORT = Number(process.env.PORT ?? 3000);

interface Player {
  name: string;
  password: string;
}

const players: Player[] = [];
const rooms: { [key: string]: Player[] } = {};
const winners = new Map<number, { name: string; wins: number }>();

const registerPlayer = (name: string, password: string) => {
  const existingPlayer = players.find((player) => player.name === name);
  if (existingPlayer) {
    return JSON.stringify({
      type: 'reg',
      data: { name, error: true, errorText: 'Player already exists' },
      id: 0,
    });
  }

  const newPlayer: Player = { name, password };
  players.push(newPlayer);

  return {
    type: 'reg',
    data: JSON.stringify({ name, index: players.length - 1, error: false, errorText: '' }),
    id: 0,
  };
};

const createRoom = (playerName: string) => {
  const roomId = Math.random().toString(36).substring(7);
  rooms[roomId] = [{ name: playerName, password: '' }];
  return { type: 'create_room', data: '', id: 0 };
};

const updateRoomState = () => {
  const roomsWithOnePlayer = Object.entries(rooms)
    .filter(([roomId, room]) => room.length === 1)
    .map(([roomId, room]) => {
      return {
        roomId,
        roomUsers: room.map((user, index) => ({ name: user.name, index })),
      };
    });

  const updateMessage = {
    type: 'update_room',
    data: JSON.stringify(roomsWithOnePlayer),
    id: 0,
  };

  return updateMessage;
};

const updateWinners = () => {
  const updateMessage = {
    type: 'update_winners',
    data: JSON.stringify(winners),
    id: 0,
  };
  return updateMessage;
};

const addUserToRoom = (roomId: string, playerId: string) => {
  console.log('rooms', rooms);
  console.log('rooms[roomId]', rooms[roomId]);
  if (rooms[roomId]) {
    const player = players.find((player) => player.name === playerId);
    console.log('player', player);
    console.log('playerId', playerId);
    if (player) {
      rooms[roomId].push(player);
      delete rooms[roomId];
      return {
        type: 'create_game',
        data: {
          idGame: Math.random().toString(36).substring(7),
          idPlayer: Math.random().toString(36).substring(7),
        },
        id: 0,
      };
    } else {
      return { type: 'error', data: 'Player not found', id: 0 };
    }
  } else {
    return { type: 'error', data: 'Room not found', id: 0 };
  }
};

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

    const wsStream = createWebSocketStream(ws, {
      decodeStrings: false,
      encoding: 'utf-8',
    });

    wsStream.on('data', async (data) => {
      try {
        const message = JSON.parse(data);
        const updateMessage = updateRoomState();
        let response;

        switch (message.type) {
          case 'reg': {
            const dataParse = JSON.parse(message.data);
            response = registerPlayer(dataParse.name, dataParse.password);
            const updateWinner = updateWinners();
            wsStream.write(JSON.stringify(response));
            wsStream.write(JSON.stringify(updateMessage));
            wsStream.write(JSON.stringify(updateWinner));
            break;
          }
          case 'create_room': {
            console.log('message.data', message);
            response = createRoom(message.data);
            wsStream.write(JSON.stringify(response));
            wsStream.write(JSON.stringify(updateMessage));
            break;
          }
          case 'add_user_to_room': {
            const dataParse = JSON.parse(message.data);
            response = addUserToRoom(dataParse.indexRoom, dataParse.id);
            // console.log('dataParse.id', dataParse.id) // undefined
            wsStream.write(JSON.stringify(response));
            wsStream.write(JSON.stringify(updateMessage));
            break;
          }
          default:
            console.log('message.type', message.type);
            break;
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
