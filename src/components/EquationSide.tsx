import styles from "./EquationSide.module.scss";
import AddIcon from "@mui/icons-material/Add";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";

type Props = {
    compounds: string[];
    balancingNumbers: number[];
};

export default function EquationSide({ compounds, balancingNumbers }: Props) {
    const formatCompound = (compound: string, index: number) => {
        let output = "";
        let inSubscript = false;

        if (balancingNumbers[index] && balancingNumbers[index] > 1) {
            output = output.concat(balancingNumbers[index].toString());
        }

        for (let i = 0; i < compound.length; i++) {
            const char = compound[i];
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

                output = output.concat(char);
            } else if (!inSubscript && char === "_") {
                // Start the subscript tag for later number(s)
                inSubscript = true;
                output = output.concat("<sub>");
            } else if (inSubscript && isNumber) {
                output = output.concat(char);
            }

            // End subscript tag at last character, if numeric
            if (i === compound.length - 1 && isNumber) {
                output = output.concat("</sub>");
            }
        }

        return { __html: output };
    };

    return (
        <Stack
            direction="row"
            spacing={1}
            className={styles.stack}
            divider={<AddIcon fontSize="large" />}
        >
            {compounds.length === 0 && <Skeleton className={styles.skeleton} />}
            {compounds.map((compound, index) => (
                <Typography key={index} variant="h4" fontWeight="bold">
                    <span
                        dangerouslySetInnerHTML={formatCompound(
                            compound,
                            index
                        )}
                    />
                </Typography>
            ))}
        </Stack>
    );
}
