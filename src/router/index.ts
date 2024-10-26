import { WebSocket } from 'ws';
import { handleRegistration } from '../controllers/playerController';
import {
  handleAddUserToRoom,
  handleCreateRoom,
} from '../controllers/roomController';
import { handleAddShips } from '../controllers/shipContrioller';

export const websocketRouter = (ws: WebSocket, message: any) => {
  const parsedMessage = JSON.parse(message);

  switch (parsedMessage.type) {
    case 'reg':
      handleRegistration(ws, parsedMessage.data);
      break;
    case 'create_room':
      handleCreateRoom(ws);
      break;
    case 'add_user_to_room':
      handleAddUserToRoom(ws, parsedMessage.data);
      break;
    case 'add_ships':
      handleAddShips(ws, parsedMessage.data);
      break;
    default:
      ws.send(
        JSON.stringify({
          type: 'error',
          data: { errorText: 'Unknown message type' },
          id: parsedMessage.id || 0,
        }),
      );
  }
};
