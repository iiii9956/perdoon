import style from "./Input.module.css";

export default function Input({ type = "text", placeholder = "placeholder", value, onChange, maxLength }) {
    return (
        <input
            className={style.input}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
        />
    );
}