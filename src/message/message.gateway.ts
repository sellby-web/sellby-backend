import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import * as cookie from 'cookie';
import { MessageService } from './message.service';
import { SendMessageDto } from './dto/send-message.dto';

function conversationRoom(advertisementId: string, userA: string, userB: string): string {
  const [u1, u2] = [userA, userB].sort();
  return `conversation:${advertisementId}:${u1}:${u2}`;
}

@WebSocketGateway({
  namespace: '/messages',
  cors: {
    origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  },
})
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly messageService: MessageService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const rawCookie = client.handshake.headers.cookie ?? '';
    const cookies = cookie.parse(rawCookie);
    const token = cookies['Authentication'];

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.userId;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(_client: Socket) {
    // Socket.IO automatically removes the client from all rooms on disconnect
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { advertisementId: string; otherUserId: string },
  ): { success: boolean; room?: string; error?: string } {
    const userId: string = client.data.userId;
    if (!userId) return { success: false, error: 'Not authenticated' };

    const room = conversationRoom(payload.advertisementId, userId, payload.otherUserId);
    client.join(room);
    return { success: true, room };
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { advertisementId: string; otherUserId: string },
  ): { success: boolean } {
    const userId: string = client.data.userId;
    if (!userId) return { success: false };

    const room = conversationRoom(payload.advertisementId, userId, payload.otherUserId);
    client.leave(room);
    return { success: true };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessageDto,
  ): Promise<{ success: boolean; data?: unknown; error?: string }> {
    const senderId: string = client.data.userId;
    if (!senderId) return { success: false, error: 'Not authenticated' };

    try {
      const saved = await this.messageService.sendMessage(senderId, payload);
      const room = conversationRoom(payload.advertisementId, senderId, payload.receiverId);
      this.server.to(room).emit('new_message', saved);
      return { success: true, data: saved };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  @SubscribeMessage('mark_viewed')
  async handleMarkViewed(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { messageIds: string[] },
  ): Promise<{ success: boolean; error?: string }> {
    const userId: string = client.data.userId;
    if (!userId) return { success: false, error: 'Not authenticated' };

    await this.messageService.markViewed(userId, payload.messageIds);
    return { success: true };
  }
}
