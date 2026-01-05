import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { X, Camera, RefreshCw } from 'lucide-react';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionId = 'qr-reader';

  useEffect(() => {
    initializeScanner();
    return () => {
      stopScanning();
    };
  }, []);

  const initializeScanner = async () => {
    try {
      // 1. Solicitar permisos y listar cámaras
      const devices = await Html5Qrcode.getCameras();
      
      if (devices && devices.length) {
        setCameras(devices);
        // Preferir cámara trasera si existe, sino la primera
        const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
        const cameraId = backCamera ? backCamera.id : devices[0].id;
        setSelectedCameraId(cameraId);
        startScanning(cameraId);
      } else {
        setError('No se detectaron cámaras en este dispositivo.');
      }
    } catch (err) {
      console.error('Error getting cameras:', err);
      setError('No se pudo acceder a la cámara. Por favor, permite el acceso en tu navegador.');
    }
  };

  const startScanning = async (cameraId: string) => {
    try {
      setError(null);
      
      // Limpiar instancia anterior si existe
      if (scannerRef.current) {
        if (isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      }

      const html5QrCode = new Html5Qrcode(qrCodeRegionId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        cameraId, 
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
          onClose(); // Cerrar modal al éxito
        },
        (errorMessage) => {
          // Ignorar errores de escaneo cuadro a cuadro
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Error starting QR scanner:', err);
      setError('Error al iniciar la cámara. Intenta seleccionar otra o recargar.');
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCameraId = e.target.value;
    setSelectedCameraId(newCameraId);
    startScanning(newCameraId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Escanear Código QR</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              stopScanning();
              onClose();
            }}
            className="hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-800 text-sm font-medium mb-2">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recargar página
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Camera Selector */}
              {cameras.length > 1 && (
                <select 
                  className="w-full p-2 border rounded-md text-sm bg-gray-50"
                  value={selectedCameraId || ''}
                  onChange={handleCameraChange}
                >
                  {cameras.map(cam => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label || `Cámara ${cam.id.slice(0, 5)}...`}
                    </option>
                  ))}
                </select>
              )}

              {/* Scanner Viewport */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
                <div id={qrCodeRegionId} className="w-full h-full" />
                {!isScanning && !error && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                    Iniciando cámara...
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500 text-center">
                Apunta la cámara al código QR de la placa del motor para buscar automáticamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
