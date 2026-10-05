interface Props {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

/** iOS-style settings toggle. */
export function Switch({ label, hint, checked, onChange }: Props) {
  return (
    <label className="switch-row">
      <span>
        <strong>{label}</strong>
        {hint ? <small>{hint}</small> : null}
      </span>
      <input
        type="checkbox"
        className="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}