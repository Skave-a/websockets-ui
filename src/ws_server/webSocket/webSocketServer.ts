import { createWebSocketStream, WebSocket } from 'ws';
import { addUserToRoom, createRoom, updateRoomState } from '../service/roomService';
import { registerPlayer, updateWinners } from '../service/userService';

const handleWebSocketConnection = (ws: WebSocket) => {
  console.log('WebSocket клиент подключен');

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
          wsStream.write(JSON.stringify(response));
          wsStream.write(JSON.stringify(updateMessage));
          break;
        }
        default:
          console.log('message.type', message.type);
          break;
      }
    } catch (error) {
      console.error('Ошибка при обработке сообщения:', error);
    }
  });
};

export { handleWebSocketConnection };
