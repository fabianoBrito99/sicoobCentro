"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./FloatingKeyboard.module.css";

type KeyboardField = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

type Props = {
  fields: KeyboardField[];
  activeFieldId: string;
};

const rows = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ç"],
  ["Z", "X", "C", "V", "B", "N", "M", ".", "@", "-"]
];

export default function FloatingKeyboard({ fields, activeFieldId }: Props) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
  const activeField = fields.find((field) => field.id === activeFieldId) ?? fields[0];

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragRef.current) {
        return;
      }

      setPosition({
        x: event.clientX - dragRef.current.offsetX,
        y: event.clientY - dragRef.current.offsetY
      });
    };
    const stopDragging = () => {
      dragRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
    };
  }, []);

  const startDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!bounds) {
      return;
    }

    if (!position) {
      setPosition({ x: bounds.left, y: bounds.top });
    }
    dragRef.current = {
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top
    };
  };

  const pressKey = (key: string) => {
    if (!activeField) {
      return;
    }

    if (key === "BACKSPACE") {
      activeField.onChange(activeField.value.slice(0, -1));
      return;
    }

    if (key === "SPACE") {
      activeField.onChange(`${activeField.value} `);
      return;
    }

    activeField.onChange(`${activeField.value}${key}`);
  };

  const positionStyle = position
    ? { left: position.x, top: position.y, transform: "none" }
    : undefined;

  return (
    <section className={styles.keyboard} style={positionStyle} aria-label="Teclado virtual">
      <div className={styles.handle} onPointerDown={startDragging}>
        <span>Teclado</span>
        <strong>{activeField?.label ?? "Campo"}</strong>
        <span className={styles.grip}>arraste aqui</span>
      </div>
      <div className={styles.keys}>
        {rows.map((row, rowIndex) => (
          <div className={styles.row} key={rowIndex}>
            {row.map((key) => (
              <button type="button" className={styles.key} key={key} onClick={() => pressKey(key)}>
                {key}
              </button>
            ))}
          </div>
        ))}
        <div className={styles.row}>
          <button type="button" className={`${styles.key} ${styles.wide}`} onClick={() => pressKey("SPACE")}>
            ESPAÇO
          </button>
          <button type="button" className={`${styles.key} ${styles.action}`} onClick={() => pressKey("BACKSPACE")}>
            APAGAR
          </button>
        </div>
      </div>
    </section>
  );
}
