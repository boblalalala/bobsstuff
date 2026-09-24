import { useEffect, useState } from 'react';
import QR from 'qrcode';

export default function QRCode({ value, className }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    QR.toDataURL(value, { margin: 1, width: 640, errorCorrectionLevel: 'M', color: { dark: '#2F4A2C', light: '#FFFFFF' } })
      .then(setSrc)
      .catch(() => setSrc(null));
  }, [value]);
  return src ? <img className={className} src={src} alt={`QR code for ${value}`} /> : <div className={className} />;
}
