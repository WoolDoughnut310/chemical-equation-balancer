import {
    ChemicalCompound,
    ChemicalCompoundRelationship,
    Errors,
} from "./types";

export const EQUATION_ARROWS = ["->", "<>"];
const CHEMICAL_SYMBOLS = [
    "H",
    "He",
    "Li",
    "Be",
    "B",
    "C",
    "N",
    "O",
    "F",
    "Ne",
    "Na",
    "Mg",
    "Al",
    "Si",
    "P",
    "S",
    "Cl",
    "Ar",
    "K",
    "Ca",
    "Sc",
    "Ti",
    "V",
    "Cr",
    "Mn",
    "Fe",
    "Co",
    "Ni",
    "Cu",
    "Zn",
    "Ga",
    "Ge",
    "As",
    "Se",
    "Br",
    "Kr",
    "Rb",
    "Sr",
    "Y",
    "Zr",
    "Nb",
    "Mo",
    "Tc",
    "Ru",
    "Rh",
    "Pd",
    "Ag",
    "Cd",
    "In",
    "Sn",
    "Sb",
    "Te",
    "I",
    "Xe",
    "Cs",
    "Ba",
    "La",
    "Ce",
    "Pr",
    "Nd",
    "Pm",
    "Sm",
    "Eu",
    "Gd",
    "Tb",
    "Dy",
    "Ho",
    "Er",
    "Tm",
    "Yb",
    "Lu",
    "Hf",
    "Ta",
    "W",
    "Re",
    "Os",
    "Ir",
    "Pt",
    "Au",
    "Hg",
    "Tl",
    "Pb",
    "Bi",
    "Po",
    "At",
    "Rn",
    "Fr",
    "Ra",
    "Ac",
    "Th",
    "Pa",
    "U",
    "Np",
    "Pu",
    "Am",
    "Cm",
    "Bk",
    "Cf",
    "Es",
    "Fm",
    "Md",
    "No",
    "Lr",
    "Rf",
    "Db",
    "Sg",
    "Bh",
    "Hs",
    "Mt",
    "Ds",
    "Rg",
    "Cn",
    "Nh",
    "Fl",
    "Mc",
    "Lv",
    "Ts",
    "Og",
];

export const hcf = (a: number, b: number) => {
    let num = a;

    while (num % b !== 0) {
        num += a;
    }

    return num;
};

export const splitEquationString = (
    equationString: string
): {
    rawReactants: string[];
    rawProducts: string[];
    elements: [Set<string>, Set<string>];
    compounds: ChemicalCompound[];
    reversible: boolean | null;
} => {
    const compounds: ChemicalCompound[] = [];

    const rawReactants: string[] = [];
    const rawProducts: string[] = [];
    const reactantElements = new Set<string>();
    const productElements = new Set<string>();
    let reachedProducts = false;
    let compoundIndex = 0;
    let element = "";
    let elementValue = "";
    let reversible: null | boolean = null;
    let skippingCompound = false;

    const appendElement = () => {
        if (element === "") return;
        if (elementValue === "0") return;

        const stringAppend = [element];

        if (elementValue !== "1" && parseInt(elementValue)) {
            stringAppend.push("_", elementValue);
        }

        const rawCompoundSide = !reachedProducts ? rawReactants : rawProducts;
        rawCompoundSide[compoundIndex] = (
            rawCompoundSide[compoundIndex] ?? ""
        ).concat(...stringAppend);

        const elementsSide = !reachedProducts
            ? reactantElements
            : productElements;
        elementsSide.add(element);

        const globalCompoundsIndex = !reachedProducts
            ? compoundIndex
            : rawReactants.length + compoundIndex;
        if (!compounds[globalCompoundsIndex])
            compounds[globalCompoundsIndex] = {};
        compounds[globalCompoundsIndex][element] =
            (compounds[globalCompoundsIndex][element] ?? 0) +
            (parseInt(elementValue) || 1);

        element = "";
        elementValue = "";
    };

    const skipCompound = () => {
        skippingCompound = true;
        element = "";
        elementValue = "";

        (!reachedProducts ? rawReactants : rawProducts).splice(
            compoundIndex,
            1
        );
        compounds.splice(
            !reachedProducts
                ? rawReactants.length + compoundIndex
                : compoundIndex,
            1
        );
    };

    // Sanitise string and split into compounds
    const rawString = equationString.replace(" ", "");
    for (let i = 0; i < rawString.length; i++) {
        const char = rawString[i];
        const charCode = char.charCodeAt(0);

        if (EQUATION_ARROWS.includes(char.concat(rawString[i + 1]))) {
            // Reached an arrow
            appendElement();
            reachedProducts = true;
            compoundIndex = 0;
            reversible =
                EQUATION_ARROWS.indexOf(char.concat(rawString[i + 1])) === 1;
            continue;
        }

        if (char === "+") {
            // Reached the end of a compound, also an element
            appendElement();
            compoundIndex++;

            if (skippingCompound) skippingCompound = false;
            continue;
        }

        // If lowercase letter was placed after number(s), skip compound
        if (elementValue !== "" && charCode >= 97 && charCode <= 122) {
            skipCompound();
            continue;
        }

        if (skippingCompound) continue;

        if (charCode >= 65 && charCode <= 90) {
            // Reached a new element (uppercase alphabet character)
            appendElement();
            element = element.concat(char);
        } else if (element !== "" && charCode >= 97 && charCode <= 122) {
            // Reached a lowercase alphabet character
            element = element.concat(char);
        } else if (element !== "" && char === "_") {
            // Started element number
            // If digits already exist, skip this element
            if (elementValue !== "") {
                element = "";
                elementValue = "";
                continue;
            }
        } else if (element !== "" && !isNaN(parseInt(char))) {
            // Got a number for element value
            elementValue = elementValue.concat(char);
        } else {
            console.log("hahah");
            console.log(element, elementValue);
            // Got an unexpected character, skip compound
            skipCompound();
            continue;
        }

        if (i === rawString.length - 1) {
            // If last character is reached
            appendElement();
        }
    }

    return {
        rawReactants,
        rawProducts,
        elements: [reactantElements, productElements],
        compounds,
        reversible,
    };
};

export const validateEquationParts = (
    reactantElements: Set<string>,
    productElements: Set<string>
) => {
    // Check if balancing would be impossible
    reactantElements.forEach((reactantElement) => {
        if (!productElements.has(reactantElement)) {
            throw Errors.IMPOSSIBLE;
        }
    });

    productElements.forEach((productElement) => {
        if (!reactantElements.has(productElement)) {
            throw Errors.IMPOSSIBLE;
        }

        // Can now also check if elements exist since they
        // have been validated to be the same with reactants
        if (!CHEMICAL_SYMBOLS.includes(productElement)) {
            throw Errors.INVALID_ELEMENT;
        }
    });

    return true;
};

export const balanceCompounds = (compounds: ChemicalCompound[]): number[] => {
    const balancingNumbers = new Array(compounds.length).fill(1);
    const relationships: ChemicalCompoundRelationship[][] = [];
    const mapped: number[][] = [];

    // Initiate hash arrays
    for (let i = 0; i < compounds.length; i++) {
        relationships.push([]);
        mapped.push([]);
    }

    const scaleWithRelationship = (
        ratio: [number, number],
        relationship: ChemicalCompoundRelationship,
        from: number,
        to: number
    ) => {
        let referenceRatio = ratio;
        let relationshipRatio = relationship.ratio;

        // Creating scales for both ratios via the shared element
        const hcfValue = hcf(referenceRatio[0], relationshipRatio[0]);

        const referenceScale = hcfValue / referenceRatio[0];
        const relationshipScale = hcfValue / relationshipRatio[0];

        referenceRatio = referenceRatio.map(
            (value) => value * referenceScale
        ) as [number, number];
        relationshipRatio = relationshipRatio.map(
            (value) => value * relationshipScale
        ) as [number, number];

        balancingNumbers[from] = referenceRatio[0];
        balancingNumbers[to] = referenceRatio[1];
        balancingNumbers[relationship.with] = relationshipRatio[1];

        for (let newRelationship of relationships[relationship.with]) {
            if (newRelationship.with === from) continue;

            scaleWithRelationship(
                [relationshipRatio[1], relationshipRatio[0]],
                newRelationship,
                relationship.with,
                from
            );
        }
    };

    for (let i = 0; i < compounds.length; i++) {
        const compound = compounds[i];
        const referenceElements = Object.keys(compound);

        for (let j = 0; j < compounds.length; j++) {
            // Skip past checking same compound
            if (j === i) continue;

            // Skip if the same pair of compounds has been checkedd#
            if (mapped[i].includes(j)) continue;

            const otherCompound = compounds[j];

            for (let element of Object.keys(otherCompound)) {
                // Only consider the shared elements of compounds
                if (!referenceElements.includes(element)) continue;

                const hcfValue = hcf(compound[element], otherCompound[element]);

                // Calculating base ratio
                const newLeftNumber = hcfValue / compound[element];
                const newRightNumber = hcfValue / otherCompound[element];

                // If either compound already has relationships with other compounds
                // Note: The number for the reference element always goes at the start of the ratio
                if (relationships[i].length > 0) {
                    for (let relationship of relationships[i]) {
                        scaleWithRelationship(
                            [newLeftNumber, newRightNumber],
                            relationship,
                            i,
                            j
                        );
                    }
                }
                if (relationships[j].length > 0) {
                    for (let relationship of relationships[j]) {
                        scaleWithRelationship(
                            [newRightNumber, newLeftNumber],
                            relationship,
                            j,
                            i
                        );
                    }
                }

                // Simply overwrite balancing numbers
                if (
                    relationships[i].length === 0 &&
                    relationships[j].length === 0
                ) {
                    balancingNumbers[i] = newLeftNumber;
                    balancingNumbers[j] = newRightNumber;
                }

                relationships[i].push({
                    with: j,
                    ratio: [newLeftNumber, newRightNumber],
                });
                relationships[j].push({
                    with: i,
                    ratio: [newRightNumber, newLeftNumber],
                });
            }
        }
    }

    return balancingNumbers;
};
