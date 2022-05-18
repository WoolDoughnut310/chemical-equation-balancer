import React, { useState, useEffect } from "react";
import styles from "./EquationDisplay.module.scss";
import { ChemicalCompound, Errors } from "../types";
import IconButton from "@mui/material/IconButton";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import MouseIcon from "@mui/icons-material/Mouse";
import BalanceIcon from "@mui/icons-material/Balance";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Slide from "@mui/material/Slide";
import Fab from "@mui/material/Fab";
import EquationInput from "./EquationInput";
import {
    balanceEquation,
    EQUATION_ARROWS,
    splitEquationString,
    validateEquationParts,
} from "../util";
import EquationSide from "./EquationSide";

export default function EquationDisplay() {
    const [reversible, setReversible] = useState(false);
    const [rawReactants, setRawReactants] = useState<string[]>([]);
    const [rawProducts, setRawProducts] = useState<string[]>([]);
    const [reactants, setReactants] = useState<ChemicalCompound[]>([]);
    const [products, setProducts] = useState<ChemicalCompound[]>([]);
    const [ions, setIons] = useState<[string[], string[]]>([[], []]);
    const [inputDialogPos, setInputDialogPos] = useState<[number, number]>([
        0, 0,
    ]);
    const [inputDialogOpen, setInputDialogOpen] = useState(false);
    const [equationInput, setEquationInput] = useState("");
    const [sideElements, setSideElements] = useState<
        [Set<string>, Set<string>]
    >([new Set<string>(), new Set<string>()]);
    const [balancingNumbers, setBalancingNumbers] = useState<
        [number[], number[]]
    >([[], []]);
    const [error, setError] = useState("");

    const onToggleInputDialog = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();

        setInputDialogPos([
            Math.min(event.clientX, window.innerWidth - 250),
            event.clientY,
        ]);
        setInputDialogOpen(!inputDialogOpen);
    };

    const onToggleReactionType = (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        event.stopPropagation();

        setEquationInput((value) =>
            reversible
                ? value.replace(EQUATION_ARROWS[1], EQUATION_ARROWS[0])
                : value.replace(EQUATION_ARROWS[0], EQUATION_ARROWS[1])
        );

        setReversible(!reversible);
    };

    const onClickBalance = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();

        // Validation
        try {
            validateEquationParts(...sideElements);
            setError("");
            console.log(true);
        } catch (error: any) {
            console.log(false);
            switch (error) {
                case Errors.IMPOSSIBLE:
                    setError("Impossible to balance");
                    break;
                case Errors.INVALID_ELEMENT:
                    setError("Invalid element entered");
                    break;
            }
        }

        const totalBalancingNumbers = balanceEquation(reactants, products);
        setBalancingNumbers(totalBalancingNumbers);
    };

    useEffect(() => {
        if (equationInput === "") setError("");
        setBalancingNumbers([[], []]);
        const equationParts = splitEquationString(equationInput);
        setRawReactants(equationParts.rawReactants);
        setRawProducts(equationParts.rawProducts);
        setReactants(equationParts.reactants);
        setProducts(equationParts.products);
        setSideElements(equationParts.elements);
        setIons(equationParts.ions);
        if (equationParts.reversible !== null) {
            setReversible(equationParts.reversible);
        }
    }, [equationInput]);

    const equationEmpty = equationInput === "" && rawReactants.length === 0;

    return (
        <Stack
            direction="row"
            className={styles.display}
            onClick={onToggleInputDialog}
        >
            {equationEmpty ? (
                <Stack direction="column" alignItems="center" spacing={2}>
                    <MouseIcon fontSize="large" />
                    <Typography variant="h6" sx={{ userSelect: "none" }}>
                        Click to get started
                    </Typography>
                </Stack>
            ) : (
                <>
                    <EquationSide
                        compounds={rawReactants}
                        ions={ions[0]}
                        balancingNumbers={balancingNumbers[0]}
                    />
                    {rawProducts.length > 0 && (
                        <IconButton
                            aria-label="Reaction type"
                            sx={{ p: 1, m: 1 }}
                            title="Change reaction type"
                            onClick={onToggleReactionType}
                        >
                            {reversible ? (
                                <SwapHorizIcon sx={{ fontSize: 60 }} />
                            ) : (
                                <ArrowForwardIcon sx={{ fontSize: 60 }} />
                            )}
                        </IconButton>
                    )}
                    {rawProducts.length > 0 && (
                        <EquationSide
                            compounds={rawProducts}
                            ions={ions[1]}
                            balancingNumbers={balancingNumbers[1]}
                        />
                    )}
                </>
            )}
            <Slide
                in={!equationEmpty}
                direction="up"
                mountOnEnter
                unmountOnExit
            >
                <div className={styles.fabContainer}>
                    <Fab
                        variant="extended"
                        color="primary"
                        onClick={onClickBalance}
                    >
                        <BalanceIcon sx={{ mr: 1 }} />
                        Balance
                    </Fab>
                    <Typography
                        variant="body1"
                        fontWeight="bold"
                        fontFamily="monospace"
                        color="error"
                        sx={{ mt: 1 }}
                    >
                        {error}
                    </Typography>
                </div>
            </Slide>
            <EquationInput
                open={inputDialogOpen}
                setOpen={setInputDialogOpen}
                position={inputDialogPos}
                value={equationInput}
                setValue={setEquationInput}
            />
        </Stack>
    );
}
