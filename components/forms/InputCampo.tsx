import styles from "./InputCampo.module.css";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  onFocus?: () => void;
};

export default function InputCampo({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  onFocus
}: Props) {
  return (
    <label className={styles.field} htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        className={`${styles.input} ${error ? styles.invalid : ""}`}
        value={value}
        type={type}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        autoComplete="off"
        inputMode="none"
      />
      {error ? <small className={styles.error}>{error}</small> : null}
    </label>
  );
}
