import style from "./Button.module.css";

export default function Button({
    text = "text",
    type = "button",
    onClick,
    className = "",
    style: customStyle,
    variant = "",
    children,
    disabled = false,
    ...rest
}) {
    const variantClass = variant === "danger" ? style.danger : "";
    return (
        <button
            className={`${style.button} ${variantClass} ${className}`.trim()}
            type={type}
            onClick={onClick}
            style={customStyle}
            disabled={disabled}
            {...rest}
        >
            {children || text}
        </button>
    );
}
