import React from "react";
import Paper from "@mui/material/Paper";
import styles from "./EquationInput.module.scss";
import Zoom from "@mui/material/Zoom";

type Props = {
    open: boolean;
    setOpen(value: React.SetStateAction<boolean>): void;
    value: string;
    setValue(value: React.SetStateAction<string>): void;
    position: [number, number];
};

export default function EquationInput({
    open,
    setOpen,
    position,
    value,
    setValue,
}: Props) {
    if (!open) return null;

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            setOpen(false);
        }
    };

    return (
        <Zoom in={open} unmountOnExit mountOnEnter>
            <Paper
                className={styles.container}
                sx={{
                    left: position[0],
                    top: position[1] - 56,
                }}
                onClick={(event) => event.stopPropagation()}
            >
                <div className={styles.field}>
                    <input
                        autoFocus
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={onKeyDown}
                        className={styles.input}
                    />
                </div>
            </Paper>
        </Zoom>
    );
}
