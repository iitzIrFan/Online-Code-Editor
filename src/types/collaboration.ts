import { Socket } from 'socket.io-client';

export interface Position {
  lineNumber: number;
  column: number;
}

export interface CodeUpdate {
  code: string;
  language: string;
  userId: string;
}

export interface UserJoined {
  userId: string;
  timestamp: Date;
}

export interface CursorMove {
  userId: string;
  position: Position;
}

export interface CollaborationCallbacks {
  onCodeUpdate: ((data: CodeUpdate) => void) | null;
  onCursorMove: ((data: CursorMove) => void) | null;
  onUserJoin: ((data: UserJoined) => void) | null;
  onUserLeave: ((userId: string) => void) | null;
  onSessionUsers: ((users: string[]) => void) | null;
  onError: ((error: string) => void) | null;
  onConnectionChange: ((connected: boolean) => void) | null;
}

export interface CollaborationEmits {
  'join-session': (sessionId: string) => void;
  'code-change': (data: { sessionId: string; code: string; language: string }) => void;
  'cursor-update': (data: { sessionId: string; position: Position }) => void;
}

export interface CollaborationEvents {
  'code-update': (data: CodeUpdate) => void;
  'cursor-move': (data: CursorMove) => void;
  'user-joined': (data: UserJoined) => void;
  'user-left': (userId: string) => void;
  'session-users': (users: string[]) => void;
  'error': (error: string) => void;
  'connect': () => void;
  'disconnect': (reason: string) => void;
  'connect_error': (error: Error) => void;
}

export type CollaborationSocket = Socket<CollaborationEvents, CollaborationEmits>; 