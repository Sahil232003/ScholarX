import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';

export interface SocketMessage {
  type: string;
  channel?: string;
  payload: any;
  timestamp?: string;
}

export class SocketHandler {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  public init(server: HttpServer): WebSocketServer {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      this.clients.add(ws);
      console.log(`[WebSocket] Client connected from ${req.socket.remoteAddress}. Active clients: ${this.clients.size}`);

      // Send initial welcome message
      this.sendToClient(ws, {
        type: 'CONNECTION_ESTABLISHED',
        channel: 'system',
        payload: {
          message: 'Connected to ScholarX Real-Time Message Bus',
          serverTime: new Date().toISOString()
        }
      });

      ws.on('message', (data: string) => {
        try {
          const parsed: SocketMessage = JSON.parse(data.toString());
          this.handleClientMessage(ws, parsed);
        } catch (err) {
          console.error('[WebSocket] Malformed message received:', err);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`[WebSocket] Client disconnected. Active clients: ${this.clients.size}`);
      });

      ws.on('error', (err) => {
        console.error('[WebSocket] Error on socket client:', err);
      });
    });

    return this.wss;
  }

  private handleClientMessage(sender: WebSocket, message: SocketMessage): void {
    const { type, channel, payload } = message;

    switch (type) {
      case 'PING':
        this.sendToClient(sender, { type: 'PONG', payload: { serverTime: new Date().toISOString() } });
        break;

      case 'STUDENT_JOIN_REQUEST':
      case 'ENROLLMENT_APPROVED':
      case 'ENROLLMENT_REJECTED':
      case 'PROCTOR_ALERT':
      case 'INTERCOM_BROADCAST':
      case 'VIVA_TELEMETRY':
        // Broadcast to all other connected clients
        this.broadcast(message, sender);
        break;

      default:
        console.log(`[WebSocket] Unhandled message type: ${type}`);
    }
  }

  public broadcast(message: SocketMessage, excludeSender?: WebSocket): void {
    const formatted = JSON.stringify({
      ...message,
      timestamp: message.timestamp || new Date().toISOString()
    });

    for (const client of this.clients) {
      if (client !== excludeSender && client.readyState === WebSocket.OPEN) {
        client.send(formatted);
      }
    }
  }

  public sendToClient(client: WebSocket, message: SocketMessage): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          ...message,
          timestamp: message.timestamp || new Date().toISOString()
        })
      );
    }
  }

  public getActiveCount(): number {
    return this.clients.size;
  }
}

export const socketHandler = new SocketHandler();
