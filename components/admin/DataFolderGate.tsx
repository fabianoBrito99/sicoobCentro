"use client";

import { useEffect, useState } from "react";
import {
  ensurePermission,
  isSupported,
  loadRootHandleFromIDB,
  pickRootHandle,
  saveRootHandleToIDB
} from "@/lib/storage/localFsAccess";

type Props = {
  children: React.ReactNode;
};

export default function DataFolderGate({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isSupported()) {
        setError("Este navegador nao suporta File System Access API.");
        setReady(false);
        return;
      }
      const handle = await loadRootHandleFromIDB();
      if (!handle) {
        setReady(false);
        return;
      }
      const granted = await ensurePermission(handle, "readwrite");
      setReady(granted);
    } catch (e) {
      setReady(false);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void check();
  }, []);

  const onPick = async () => {
    setError(null);
    try {
      const handle = await pickRootHandle();
      const ok = await ensurePermission(handle, "readwrite");
      if (!ok) {
        setError("Permissao de leitura/escrita foi negada.");
        return;
      }
      await saveRootHandleToIDB(handle);
      setReady(true);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (loading) {
    return <section className="panel centered">Validando pasta de dados...</section>;
  }

  if (!ready) {
    return (
      <section className="panel centered">
        <h2>Pasta de dados</h2>
        <p>Selecione a pasta raiz do projeto (uma vez). O app vai reutilizar nas proximas aberturas.</p>
        <button className="btn-primary" onClick={onPick} type="button">
          Selecionar pasta de dados
        </button>
        {error ? <p className="error-text">{error}</p> : null}
      </section>
    );
  }

  return <>{children}</>;
}
