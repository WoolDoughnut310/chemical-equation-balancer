import React from "react";
import styles from "./App.module.scss";
import EquationDisplay from "./components/EquationDisplay";
import Stack from "@mui/material/Stack";
import {
    createTheme,
    ThemeProvider,
    responsiveFontSizes,
} from "@mui/material/styles";

const theme = responsiveFontSizes(createTheme());

function App() {
    return (
        <ThemeProvider theme={theme}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>Balancer Pro</h1>
                </header>
                <Stack direction="row" className={styles.mainRow}>
                    <div style={{ flex: 0.1 }} />
                    <EquationDisplay />
                    <div style={{ flex: 0.1 }} />
                </Stack>
                <div className={styles.footerLabel}>Created by Joseph Nma.</div>
            </div>
        </ThemeProvider>
    );
}

export default App;
