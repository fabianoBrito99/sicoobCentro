"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DailyGameSelection, GameType, PlayerFormData } from "@/types/game";
import BackHomeButton from "@/components/common/BackHomeButton";
import InputCampo from "@/components/forms/InputCampo";
import BotaoPrimario from "@/components/common/BotaoPrimario";
import FloatingKeyboard from "@/components/common/FloatingKeyboard";
import LogoHeader from "@/components/common/LogoHeader";
import BackgroundMarca from "@/components/layout/BackgroundMarca";
import { hasCpfPlayedGame } from "@/services/client/api";
import { maskCpf, maskPhone } from "@/utils/masks";
import { isFormValid, isValidCpf, validateForm } from "@/utils/validators";
import { savePlayerSession } from "@/utils/session";
import styles from "./FormularioJogador.module.css";

const routeByGame: Record<GameType, string> = {
  memory: "/game/memory",
  wordsearch: "/game/wordsearch"
};

const gameLabel: Record<GameType, string> = {
  memory: "Jogo da Memória",
  wordsearch: "Caça-palavras"
};

type Props = {
  dailyGame: DailyGameSelection;
};

export default function FormularioJogador({ dailyGame }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<PlayerFormData>({
    fullName: "",
    cpf: "",
    phone: "(69) 9",
    email: "",
    consentAccepted: false
  });
  const [cpfDuplicateError, setCpfDuplicateError] = useState("");
  const [checkingCpf, setCheckingCpf] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState("fullName");

  const errors = useMemo(() => validateForm(form), [form]);
  const valid = isFormValid(form) && !cpfDuplicateError && !checkingCpf;
  const keyboardFields = [
    { id: "fullName", label: "Nome completo", value: form.fullName, onChange: (value: string) => setForm((current) => ({ ...current, fullName: value })) },
    { id: "cpf", label: "CPF", value: form.cpf, onChange: (value: string) => setForm((current) => ({ ...current, cpf: maskCpf(value) })) },
    { id: "phone", label: "Telefone", value: form.phone, onChange: (value: string) => setForm((current) => ({ ...current, phone: maskPhone(value) })) },
    { id: "email", label: "E-mail", value: form.email, onChange: (value: string) => setForm((current) => ({ ...current, email: value })) }
  ];

  useEffect(() => {
    void router.prefetch(routeByGame[dailyGame.game]);
  }, [dailyGame.game, router]);

  useEffect(() => {
    let active = true;

    if (!isValidCpf(form.cpf)) {
      setCheckingCpf(false);
      setCpfDuplicateError("");
      return () => {
        active = false;
      };
    }

    setCheckingCpf(true);
    const timeoutId = window.setTimeout(() => {
      const checkDuplicate = async () => {
        const alreadyPlayed = await hasCpfPlayedGame(form.cpf, dailyGame.game);
        if (!active) {
          return;
        }

        setCpfDuplicateError(
          alreadyPlayed ? `Este CPF já participou do ${gameLabel[dailyGame.game]}.` : ""
        );
        setCheckingCpf(false);
      };

      void checkDuplicate();
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [dailyGame.game, form.cpf]);

  const handleStart = async () => {
    const alreadyPlayed = await hasCpfPlayedGame(form.cpf, dailyGame.game);
    if (alreadyPlayed) {
      setCpfDuplicateError(`Este CPF já participou do ${gameLabel[dailyGame.game]}.`);
      return;
    }

    savePlayerSession({ player: form, game: dailyGame.game });
    router.push(routeByGame[dailyGame.game]);
  };

  return (
    <main className={styles.page}>
      <BackgroundMarca />
      <BackHomeButton game={dailyGame.game} />
      <FloatingKeyboard fields={keyboardFields} activeFieldId={activeFieldId} />
      <section className={styles.panel}>
        <div className={styles.center}>
          <LogoHeader compact />
        </div>

        <div className={styles.heading}>
          <h1>Preencha seus dados para iniciar.</h1>
          <p>Campos obrigatórios *</p>
        </div>
        <div className={styles.grid}>
          <InputCampo
            id="fullName"
            label="Nome completo"
            value={form.fullName}
            onChange={(value) => setForm((current) => ({ ...current, fullName: value }))}
            placeholder="Digite nome e sobrenome"
            error={errors.fullName}
            onFocus={() => setActiveFieldId("fullName")}
          />
          <InputCampo
            id="cpf"
            label="CPF"
            value={form.cpf}
            onChange={(value) => setForm((current) => ({ ...current, cpf: maskCpf(value) }))}
            placeholder="000.000.000-00"
            error={cpfDuplicateError || errors.cpf}
            onFocus={() => setActiveFieldId("cpf")}
          />
          <InputCampo
            id="phone"
            label="Telefone"
            value={form.phone}
            onChange={(value) => setForm((current) => ({ ...current, phone: maskPhone(value) }))}
            placeholder="(69) 99999-9999"
            error={errors.phone}
            onFocus={() => setActiveFieldId("phone")}
          />
          <InputCampo
            id="email"
            label="E-mail"
            value={form.email}
            onChange={(value) => setForm((current) => ({ ...current, email: value }))}
            placeholder="voce@empresa.com"
            type="email"
            error={errors.email}
            onFocus={() => setActiveFieldId("email")}
          />
        </div>
        <label className={styles.consent}>
          <input
            type="checkbox"
            checked={form.consentAccepted}
            onChange={(event) => setForm((current) => ({ ...current, consentAccepted: event.target.checked }))}
          />
          <span>Estou ciente de que meus dados serão compartilhados com o Sicoob Centro.</span>
        </label>
        {errors.consentAccepted ? <small className={styles.consentError}>{errors.consentAccepted}</small> : null}
        <BotaoPrimario onClick={() => void handleStart()} disabled={!valid} block>
          {checkingCpf ? "Validando CPF..." : "Iniciar"}
        </BotaoPrimario>
      </section>
    </main>
  );
}
