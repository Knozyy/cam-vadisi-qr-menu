import { backupUrl } from '../lib/api.js';
import { Button } from '../ui/form.jsx';

/** Yedek indirme. data.db + gorseller tek arsivde. Kendi sunucuda yedek bizim isimiz. */
export function ToolsPanel() {
  return (
    <div className="max-w-xl space-y-4">
      <div className="rounded-xl border border-line-strong bg-surface p-5">
        <h3 className="font-display text-lg font-semibold text-pine">Yedek al</h3>
        <p className="mt-1 text-[14px] leading-relaxed text-muted">
          Tüm menü verisi ve yüklenen görseller tek bir zip dosyası olarak iner.
          Düzenli aralıklarla indirip güvenli bir yerde saklayın.
        </p>
        <a href={backupUrl()} download>
          <Button className="mt-4">Yedeği indir (.zip)</Button>
        </a>
      </div>
    </div>
  );
}
