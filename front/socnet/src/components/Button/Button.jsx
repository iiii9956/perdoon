import style from "./Button.module.css";

export default function Button({ text = "text", type = "button", onClick }) {
    return (
        <button className={style.button} type={type} onClick={onClick}>
            {text}
        </button>
    );
}