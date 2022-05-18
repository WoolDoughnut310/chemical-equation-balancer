import { useState, useEffect } from "react";
import styles from "./EquationSide.module.scss";
import AddIcon from "@mui/icons-material/Add";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";

type Props = {
    compounds: string[];
    ions: string[];
    balancingNumbers: number[];
};

export default function EquationSide({
    compounds,
    ions,
    balancingNumbers,
}: Props) {
    const [entities, setEntities] = useState<string[]>([]);

    const formatEntity = (entity: string, index: number) => {
        let output = "";
        let inSubscript = false;
        let inSuperscript = false;

        if (balancingNumbers[index] && balancingNumbers[index] > 1) {
            output = output.concat(balancingNumbers[index].toString());
        }

        for (let i = 0; i < entity.length; i++) {
            const char = entity[i];
            const charCode = char.charCodeAt(0);
            const isNumber = !isNaN(parseInt(char));

            // Alphabet character or brackets
            if (
                (charCode >= 65 && charCode <= 90) ||
                (charCode >= 97 && charCode <= 122) ||
                [40, 41].includes(charCode)
            ) {
                // If previous character(s) were number(s), end subscript tag
                if (inSubscript) {
                    output = output.concat("</sub>");
                    inSubscript = false;
                }

                if (inSuperscript) {
                    output = output.concat("</sup>");
                    inSuperscript = false;
                }

                output = output.concat(char);
            } else if (!inSubscript && char === "_") {
                // Start the subscript tag for later number(s)
                inSubscript = true;
                output = output.concat("<sub>");
            } else if (inSubscript && isNumber) {
                output = output.concat(char);
            } else if (!inSuperscript && char === "[") {
                // If previous character(s) were in subscript, end subscript tag
                if (inSubscript) {
                    output = output.concat("</sub>");
                    inSubscript = false;
                }

                // Start the superscript tag for later ion charges
                console.log("hi");
                inSuperscript = true;
                output = output.concat("<sup>");
            } else if (inSuperscript && isNumber) {
                output = output.concat(char);
            } else if (inSuperscript && [43, 45].includes(charCode)) {
                // Got the charge on the ion
                output = output.concat(char);
            }

            // End subscript tag at last character, if numeric
            if (i === entity.length - 1 && isNumber) {
                output = output.concat("</sub>");
            }
        }

        return { __html: output };
    };

    useEffect(() => {
        let entities = [...compounds];
        let lastIndex = Infinity;

        ions.forEach((ion, i) => {
            const insertIndex = i <= lastIndex ? i + 1 : i;
            entities.splice(insertIndex, 0, ion);
        });

        setEntities(entities);
    }, [compounds, ions]);

    return (
        <Stack
            direction="row"
            spacing={1}
            className={styles.stack}
            divider={<AddIcon fontSize="large" />}
        >
            {entities.length === 0 && <Skeleton className={styles.skeleton} />}
            {entities.map((entity, index) => (
                <Typography key={index} variant="h4" fontWeight="bold">
                    <span
                        dangerouslySetInnerHTML={formatEntity(entity, index)}
                    />
                </Typography>
            ))}
        </Stack>
    );
}
