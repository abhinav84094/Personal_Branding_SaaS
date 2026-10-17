import React from "react";
import { Eye, EyeOff } from "lucide-react";
export default function PasswordField({
  label,
  value,
  onChange,
  autoComplete = "new-password",
  required = true,
}) {
  const id = React.useId();
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="password-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-field-control">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          minLength={8}
          maxLength={128}
          required={required}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={(visible ? "Hide " : "Show ") + label.toLowerCase()}
          aria-controls={id}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          <span>{visible ? "Hide" : "Show"}</span>
        </button>
      </div>
    </div>
  );
}
