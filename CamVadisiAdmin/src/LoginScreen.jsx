import { useState } from 'react';
import { api } from './lib/api.js';
import { Button, TextInput } from './ui/form.jsx';

export function LoginScreen({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.login(password);
      onSuccess();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-sage px-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-surface p-7 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-semibold text-pine">Çam Vadisi</h1>
          <p className="mt-1 text-[13px] uppercase tracking-widest text-muted">Yönetim Paneli</p>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-muted">Şifre</span>
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
          />
        </label>
        {error && <p className="mt-3 text-[13px] text-danger">{error}</p>}
        <Button type="submit" disabled={busy || !password} className="mt-5 w-full">
          {busy ? 'Kontrol ediliyor…' : 'Giriş yap'}
        </Button>
      </form>
    </div>
  );
}
