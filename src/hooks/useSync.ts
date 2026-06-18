import { useState, useEffect, useRef, useCallback } from 'react';
import { Peer, DataConnection } from 'peerjs';

export type SyncStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export function useSync(onReceiveText: (text: string) => void) {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [remotePeerId, setRemotePeerId] = useState<string | null>(null);
  const [status, setStatus] = useState<SyncStatus>('disconnected');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const onReceiveRef = useRef(onReceiveText);

  // Update ref to latest callback so we don't need to depend on it in useEffect
  useEffect(() => {
    onReceiveRef.current = onReceiveText;
  }, [onReceiveText]);

  useEffect(() => {
    const peer = new Peer();

    peer.on('open', (id) => {
      setPeerId(id);
    });

    peer.on('connection', (conn) => {
      // Disconnect existing if any
      if (connRef.current) {
        connRef.current.close();
      }
      setupConnection(conn);
    });

    peer.on('error', (err) => {
      console.error('PeerJS error:', err);
      setStatus('error');
      setErrorMsg(err.message);
    });

    peerRef.current = peer;

    return () => {
      peer.destroy();
    };
  }, []);

  const setupConnection = useCallback((conn: DataConnection) => {
    connRef.current = conn;
    setRemotePeerId(conn.peer);
    setStatus('connecting');

    conn.on('open', () => {
      setStatus('connected');
      setErrorMsg(null);
    });

    conn.on('data', (data) => {
      if (typeof data === 'string') {
        onReceiveRef.current(data);
      }
    });

    conn.on('close', () => {
      setStatus('disconnected');
      setRemotePeerId(null);
      connRef.current = null;
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
      setStatus('error');
      setErrorMsg(err.message);
    });
  }, []);

  const connectToPeer = useCallback((id: string) => {
    if (!peerRef.current || status === 'connected') return;
    setStatus('connecting');
    const conn = peerRef.current.connect(id);
    setupConnection(conn);
  }, [status, setupConnection]);

  const disconnect = useCallback(() => {
    if (connRef.current) {
      connRef.current.close();
      connRef.current = null;
    }
    setStatus('disconnected');
    setRemotePeerId(null);
  }, []);

  const sendText = useCallback((text: string) => {
    if (connRef.current && status === 'connected') {
      connRef.current.send(text);
    }
  }, [status]);

  return {
    peerId,
    remotePeerId,
    status,
    errorMsg,
    connectToPeer,
    disconnect,
    sendText
  };
}
