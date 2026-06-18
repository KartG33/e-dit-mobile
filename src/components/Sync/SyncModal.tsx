import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Smartphone, Scan, CheckCircle2, AlertCircle } from 'lucide-react';
import { SyncStatus } from '../../hooks/useSync';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  peerId: string | null;
  remotePeerId: string | null;
  status: SyncStatus;
  errorMsg: string | null;
  onConnect: (id: string) => void;
  onDisconnect: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  peerId,
  remotePeerId,
  status,
  errorMsg,
  onConnect,
  onDisconnect
}) => {
  const [tab, setTab] = useState<'share' | 'scan'>('share');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [manualId, setManualId] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (peerId && tab === 'share') {
      QRCode.toDataURL(peerId, {
        width: 256,
        margin: 2,
        color: { dark: '#1e293b', light: '#ffffff' }
      })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error(err));
    }
  }, [peerId, tab]);

  useEffect(() => {
    if (tab === 'scan' && isOpen && status === 'disconnected') {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          scanner.stop().catch(console.error);
          onConnect(decodedText);
        },
        () => {
          // Ignored to avoid spamming console
        }
      ).catch(() => {
        setScanError('Не удалось получить доступ к камере.');
      });

      return () => {
        if (scannerRef.current?.isScanning) {
          scannerRef.current.stop().catch(console.error);
        }
      };
    }
  }, [tab, isOpen, status, onConnect]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#111520] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <h2 className="text-lg font-semibold text-gray-200">Синхронизация устройств</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Status Area */}
        {status !== 'disconnected' ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            {status === 'connecting' && (
              <div className="animate-pulse text-blue-400 font-medium mb-4">Установка соединения...</div>
            )}
            {status === 'connected' && (
              <>
                <CheckCircle2 size={48} className="text-green-500 mb-4" />
                <div className="text-xl font-bold text-gray-100 mb-2">Устройства связаны</div>
                <div className="text-gray-400 text-sm mb-6">ID устройства: <span className="font-mono text-gray-300">{remotePeerId}</span></div>
                <button 
                  onClick={onDisconnect}
                  className="px-6 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-xl transition-colors font-medium"
                >
                  Отключиться
                </button>
              </>
            )}
            {status === 'error' && (
              <>
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <div className="text-red-400 mb-4">{errorMsg || 'Произошла ошибка при подключении.'}</div>
                <button onClick={onDisconnect} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">Повторить</button>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${tab === 'share' ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                onClick={() => setTab('share')}
              >
                <Smartphone size={16} /> Поделиться
              </button>
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${tab === 'scan' ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                onClick={() => setTab('scan')}
              >
                <Scan size={16} /> Подключиться
              </button>
            </div>

            <div className="p-6">
              {tab === 'share' && (
                <div className="flex flex-col items-center text-center">
                  <div className="text-sm text-gray-400 mb-4">Отсканируйте этот код с другого устройства, чтобы начать мгновенную синхронизацию текста.</div>
                  <div className="bg-white p-2 rounded-xl shadow-inner mb-4">
                    {qrCodeDataUrl ? (
                      <img src={qrCodeDataUrl} alt="QR Code" className="w-48 h-48 rounded-lg" />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-gray-400 bg-gray-100 rounded-lg">Генерация...</div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">Ваш ID: <span className="font-mono text-gray-300 ml-1">{peerId || '...'}</span></div>
                </div>
              )}

              {tab === 'scan' && (
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-[250px] aspect-square bg-black/50 rounded-xl overflow-hidden border-2 border-dashed border-gray-600 mb-4 relative flex items-center justify-center">
                    {scanError ? (
                      <div className="text-red-400 text-sm text-center p-4">{scanError}</div>
                    ) : (
                      <div id="qr-reader" className="w-full h-full" />
                    )}
                  </div>
                  
                  <div className="w-full flex items-center gap-2 mt-2">
                    <div className="h-px bg-white/10 flex-1" />
                    <span className="text-xs text-gray-500 uppercase">или введите id</span>
                    <div className="h-px bg-white/10 flex-1" />
                  </div>
                  
                  <div className="w-full mt-4 flex gap-2">
                    <input
                      type="text"
                      placeholder="Peer ID..."
                      value={manualId}
                      onChange={(e) => setManualId(e.target.value)}
                      className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500/50"
                    />
                    <button
                      onClick={() => manualId.trim() && onConnect(manualId.trim())}
                      disabled={!manualId.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
