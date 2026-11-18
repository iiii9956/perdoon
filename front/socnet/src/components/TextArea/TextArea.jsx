import style from "./TextArea.module.css";

export default function TextArea({ type = "text", placeholder = "placeholder", value, onChange, maxLength }) {
    return (
        <textarea
            className={style.textArea}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
        />
    );
}