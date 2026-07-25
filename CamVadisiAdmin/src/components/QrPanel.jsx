import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button, Field, TextInput } from '../ui/form.jsx';

/**
 * Masalara basilacak QR. Menu sitesinin adresini kodlar (masaya OZEL degil - tek QR).
 * SVG (baskida keskin) ve PNG (kolay paylasim) olarak indirilebilir.
 */
export function QrPanel() {
  /**
   * QR DOGRUDAN menuyu acar (`/menu`), tanitim ana sayfasini degil: masadaki misafir
   * bir tik daha yapmak zorunda kalmamali.
   */
  const defaultUrl = `${window.location.origin}/menu`;
  const [url, setUrl] = useState(defaultUrl);
  const [svg, setSvg] = useState('');
  const [pngUrl, setPngUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    const opts = { errorCorrectionLevel: 'M', margin: 2, color: { dark: '#24402F', light: '#FFFFFF' } };
    QRCode.toString(url, { ...opts, type: 'svg', width: 512 }).then((s) => !cancelled && setSvg(s));
    QRCode.toDataURL(url, { ...opts, width: 1024 }).then((d) => !cancelled && setPngUrl(d));
    return () => { cancelled = true; };
  }, [url]);

  function download(content, filename, type) {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const href = URL.createObjectURL(blob);
    triggerDownload(href, filename);
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }

  return (
    <div className="max-w-xl space-y-5 rounded-xl border border-line-strong bg-surface p-5">
      <Field label="Menü adresi" hint="QR bu adresi açar — doğrudan menü, ana sayfa değil">
        <TextInput value={url} onChange={(e) => setUrl(e.target.value)} />
      </Field>

      <div className="flex flex-col items-center gap-4 rounded-xl bg-sage/50 p-6">
        <div className="h-56 w-56 [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
        <p className="text-[13px] text-muted-soft">Masalara veya duvara basmak için indirin.</p>
        <div className="flex gap-2">
          <Button onClick={() => download(svg, 'cam-vadisi-qr.svg', 'image/svg+xml')} disabled={!svg}>SVG indir</Button>
          <Button variant="outline" onClick={() => pngUrl && triggerDownload(pngUrl, 'cam-vadisi-qr.png')} disabled={!pngUrl}>PNG indir</Button>
        </div>
      </div>
    </div>
  );
}

function triggerDownload(href, filename) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
