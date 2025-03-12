import {
    Badge,
    Box,
    Button,
    HStack,
    Input,
    Spinner,
    Text,
    useClipboard,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { FC, useEffect, useState } from 'react';
import { collaborationService } from '../services/collaboration';
import { CodeUpdate } from '../types/collaboration';

interface CollaborationPanelProps {
  onCodeUpdate: (code: string, language: string) => void;
}

const CollaborationPanel: FC<CollaborationPanelProps> = ({ onCodeUpdate }) => {
  const [sessionId, setSessionId] = useState<string>('');
  const [joinSessionId, setJoinSessionId] = useState<string>('');
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { onCopy } = useClipboard(sessionId);
  const toast = useToast();

  useEffect(() => {
    setIsConnecting(true);
    collaborationService.connect();

    collaborationService.onCodeUpdate((data: CodeUpdate) => {
      console.log('Received code update in panel:', data);
      onCodeUpdate(data.code, data.language);
    });

    collaborationService.onUserJoin((data) => {
      toast({
        title: 'User joined',
        description: `User ${data.userId} joined the session`,
        status: 'info',
        duration: 3000,
      });
    });

    collaborationService.onUserLeave((userId) => {
      toast({
        title: 'User left',
        description: `User ${userId} left the session`,
        status: 'info',
        duration: 3000,
      });
      setConnectedUsers((users) => users.filter((id) => id !== userId));
    });

    collaborationService.onSessionUsers((users) => {
      console.log('Updating connected users:', users);
      setConnectedUsers(users);
    });

    collaborationService.onError((error) => {
      console.error('Collaboration error:', error);
      setConnectionError(error);
      toast({
        title: 'Connection Error',
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    });

    collaborationService.onConnectionChange((connected) => {
      setIsConnecting(!connected);
      if (connected) {
        setConnectionError(null);
      }
    });

    return () => {
      collaborationService.disconnect();
    };
  }, []);

  const createNewSession = () => {
    if (!collaborationService.isConnected) {
      toast({
        title: 'Not Connected',
        description: 'Waiting for server connection...',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    const newSessionId = collaborationService.createSession();
    if (newSessionId) {
      setSessionId(newSessionId);
      toast({
        title: 'Session created',
        description: 'Share the session ID with others to collaborate',
        status: 'success',
        duration: 5000,
      });
    }
  };

  const joinSession = () => {
    if (!collaborationService.isConnected) {
      toast({
        title: 'Not Connected',
        description: 'Waiting for server connection...',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (!joinSessionId) {
      toast({
        title: 'Error',
        description: 'Please enter a session ID',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    collaborationService.joinSession(joinSessionId);
    setSessionId(joinSessionId);
    toast({
      title: 'Session joined',
      description: 'You have joined the collaboration session',
      status: 'success',
      duration: 3000,
    });
  };

  const copySessionId = () => {
    onCopy();
    toast({
      title: 'Copied',
      description: 'Session ID copied to clipboard',
      status: 'success',
      duration: 2000,
    });
  };

  if (isConnecting) {
    return (
      <Box p={4} borderLeft="1px" borderColor="gray.600">
        <VStack spacing={4}>
          <Text>Connecting to server...</Text>
          <Spinner />
        </VStack>
      </Box>
    );
  }

  if (connectionError) {
    return (
      <Box p={4} borderLeft="1px" borderColor="gray.600">
        <VStack spacing={4}>
          <Text color="red.400">Connection Error</Text>
          <Text fontSize="sm">{connectionError}</Text>
          <Button
            onClick={() => {
              setIsConnecting(true);
              collaborationService.connect();
            }}
          >
            Retry Connection
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={4} borderLeft="1px" borderColor="gray.600">
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">
          Collaboration
        </Text>

        {!sessionId ? (
          <>
            <Button colorScheme="blue" onClick={createNewSession}>
              Create New Session
            </Button>
            <Text>- or -</Text>
            <HStack>
              <Input
                placeholder="Enter Session ID"
                value={joinSessionId}
                onChange={(e) => setJoinSessionId(e.target.value)}
              />
              <Button onClick={joinSession}>Join</Button>
            </HStack>
          </>
        ) : (
          <VStack align="stretch" spacing={4}>
            <HStack>
              <Text>Session ID:</Text>
              <Badge>{sessionId}</Badge>
              <Button size="sm" onClick={copySessionId}>
                Copy
              </Button>
            </HStack>

            <Box>
              <Text mb={2}>Connected Users ({connectedUsers.length}):</Text>
              <VStack align="stretch">
                {connectedUsers.map((userId) => (
                  <Text key={userId} fontSize="sm">
                    {userId}
                  </Text>
                ))}
              </VStack>
            </Box>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default CollaborationPanel; 