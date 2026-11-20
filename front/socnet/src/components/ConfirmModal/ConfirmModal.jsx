import { useEffect } from "react";
import Box from "../Box/Box";
import Button from "../Button/Button";
import style from "./ConfirmModal.module.css";

export default function ConfirmModal({
    isOpen,
    title = "Подтверждение",
    message = "Вы уверены, что хотите выполнить это действие?",
    confirmText = "Удалить",
    cancelText = "Отмена",
    onConfirm,
    onCancel,
    danger = true
}) {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onCancel?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div className={style.overlay} onClick={onCancel}>
            <div className={style.modalContent} onClick={(e) => e.stopPropagation()}>
                <Box>
                    <h3 className={style.title}>{title}</h3>
                    <p className={style.message}>{message}</p>
                    <div className={style.actions}>
                        <Button
                            text={cancelText}
                            onClick={onCancel}
                        />
                        <Button
                            text={confirmText}
                            onClick={onConfirm}
                            variant={danger ? "danger" : ""}
                        />
                    </div>
                </Box>
            </div>
        </div>
    );
}
