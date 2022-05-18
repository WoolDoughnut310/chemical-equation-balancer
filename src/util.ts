import { ChemicalCompound, Errors } from "./types";

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
    // compounds: ChemicalCompound[];
    reactants: ChemicalCompound[];
    products: ChemicalCompound[];
    ions: [string[], string[]];
    reversible: boolean | null;
} => {
    // const compounds: ChemicalCompound[] = [];
    const reactants: ChemicalCompound[] = [];
    const products: ChemicalCompound[] = [];
    const ions: [string[], string[]] = [[], []];

    const rawReactants: string[] = [];
    const rawProducts: string[] = [];
    const reactantElements: string[] = [];
    const productElements: string[] = [];
    let reachedProducts = false;
    let compoundIndex = 0;
    let element = "";
    let elementValue = "";
    let reversible: null | boolean = null;
    let multiplier: {
        from: number;
        to: number;
        scale: number;
        compoundStart: number;
        compoundEnd: number;
    } = {
        from: -1,
        to: -1,
        scale: 0,
        compoundStart: -1,
        compoundEnd: -1,
    };
    let currentIon: null | {
        charge: number;
        start: number;
        end: number;
        sign: number;
    } = null;
    const rawString = equationString.replace(" ", "");

    const appendElement = () => {
        if (element === "") return;
        if (elementValue === "0") return;

        const stringAppend = [element];

        if (elementValue !== "1" && parseInt(elementValue)) {
            stringAppend.push("_", elementValue);
        }

        const compoundSide = !reachedProducts ? reactants : products;
        if (!compoundSide[compoundIndex]) compoundSide[compoundIndex] = {};
        compoundSide[compoundIndex][element] =
            (compoundSide[compoundIndex][element] ?? 0) +
            (parseInt(elementValue) || 1);

        const rawCompoundSide = !reachedProducts ? rawReactants : rawProducts;
        rawCompoundSide[compoundIndex] = (
            rawCompoundSide[compoundIndex] ?? ""
        ).concat(...stringAppend);

        const elementsSide = !reachedProducts
            ? reactantElements
            : productElements;
        elementsSide.push(element);

        // const globalCompoundsIndex = !reachedProducts
        //     ? compoundIndex
        //     : reactants.length + compoundIndex;
        // if (!compounds[globalCompoundsIndex])
        //     compounds[globalCompoundsIndex] = {};
        // compounds[globalCompoundsIndex][element] =
        //     (compounds[globalCompoundsIndex][element] ?? 0) +
        //     (parseInt(elementValue) || 1);

        element = "";
        elementValue = "";
    };

    const multiplyElements = () => {
        if (
            multiplier.from === -1 ||
            multiplier.to === -1 ||
            multiplier.scale <= 1
        )
            return;

        const scale = multiplier.scale;

        const rawCompoundSide = !reachedProducts ? rawReactants : rawProducts;
        const originalRawCompound = rawCompoundSide[compoundIndex];
        let currentValue = "";
        let currentElement = "";
        let elements: { [key: string]: number } = {};

        for (let i = 0; i < rawString.length; i++) {
            // Allow only the from-to range
            if (i < multiplier.from || i >= multiplier.to) continue;

            const char = rawString[i];
            const charCode = char.charCodeAt(0);
            const gotNumeric = !isNaN(parseInt(char));

            if (charCode >= 65 && charCode <= 90 && i !== multiplier.from) {
                // If previous element was given no value
                elements[currentElement] =
                    currentValue === "" ? 1 : parseInt(currentValue);
                currentValue = "";
            }

            if (charCode >= 65 && charCode <= 90) {
                currentElement = "";
                currentElement = currentElement.concat(char);
            }

            if (charCode >= 97 && charCode <= 122) {
                currentElement = currentElement.concat(char);
            }

            if (gotNumeric) {
                // Append char to value string
                currentValue = currentValue.concat(char);
            }

            if (i === multiplier.to - 1) {
                // If previous element was given no value
                elements[currentElement] =
                    currentValue === "" ? 1 : parseInt(currentValue);
                currentValue = "";
            }
        }

        // Splice the section from the raw string and add brackets
        let rawCompound = originalRawCompound;
        let scalingSplice = rawString.slice(multiplier.from, multiplier.to);
        rawCompound = rawString.slice(
            multiplier.compoundStart,
            multiplier.from
        );

        if (scale !== 0) {
            rawCompound = rawCompound.concat(scalingSplice);
        }

        rawCompound = rawCompound.concat(
            rawString.slice(multiplier.to, multiplier.compoundEnd + 1)
        );

        rawCompoundSide[compoundIndex] = rawCompound;

        const compoundSide = !reachedProducts ? reactants : products;
        for (let element of Object.keys(elements)) {
            const compound = compoundSide[compoundIndex];
            let newNumber = elements[element] * scale;

            // Take of the spliced section element's affect
            // on overall number, and then add scaled number
            let value = compound[element] - elements[element] + newNumber;
            compound[element] = value;
        }

        multiplier.from = -1;
        multiplier.to = -1;
        multiplier.scale = 0;
    };

    const skipElement = () => {
        element = "";
        elementValue = "";
    };

    // Split into compounds
    let lastCompoundStart = 0;
    for (let i = 0; i < rawString.length; i++) {
        const char = rawString[i];
        const charCode = char.charCodeAt(0);
        const gotNumeric = !isNaN(parseInt(char));

        if (EQUATION_ARROWS.includes(char.concat(rawString[i + 1]))) {
            // Reached an arrow
            appendElement();
            reachedProducts = true;
            compoundIndex = 0;
            reversible =
                EQUATION_ARROWS.indexOf(char.concat(rawString[i + 1])) === 1;
            continue;
        }

        if (currentIon === null && char === "+") {
            // Reached the end of a compound, also an element
            appendElement();

            // Scale element values if brackets were used previously
            multiplyElements();

            compoundIndex++;
            lastCompoundStart = i + 1;
            continue;
        }

        // If lowercase letter was placed after number(s), skip compound
        if (elementValue !== "" && charCode >= 97 && charCode <= 122) {
            skipElement();
            continue;
        }

        if (charCode >= 65 && charCode <= 90) {
            // Reached a new element (uppercase alphabet character)
            appendElement();
            multiplyElements();
            element = element.concat(char);
        } else if (element !== "" && charCode >= 97 && charCode <= 122) {
            // Reached a lowercase alphabet character
            element = element.concat(char);
        } else if (element !== "" && char === "_") {
            // Started element number
            // If digits already exist, skip this element
            if (elementValue !== "") {
                skipElement();
                continue;
            }
        } else if (currentIon === null && element !== "" && gotNumeric) {
            // Got a number for element value
            elementValue = elementValue.concat(char);
        } else if (multiplier.from === -1 && char === "(") {
            // Got an open bracket, with none previously
            multiplier.from = i + 1;
            multiplier.compoundStart = lastCompoundStart;
            appendElement();
        } else if (multiplier.from !== -1 && char === ")") {
            multiplier.to = i;
            appendElement();
        } else if (multiplier.from !== -1 && multiplier.to !== -1) {
            if (char === "_" && multiplier.scale !== 0) {
                // If got underscore but scale already exists
                multiplier.scale = 0;
                continue;
            } else if (gotNumeric) {
                // If got a number after the closed bracket
                multiplier.scale = multiplier.scale * 10 + parseInt(char);
                multiplier.compoundEnd = i;
            }
        } else if (
            currentIon === null &&
            char === "[" &&
            (element !== "" || elementValue !== "")
        ) {
            // Started ion bracket
            currentIon = {
                charge: 0,
                start: lastCompoundStart,
                end: i,
                sign: 0,
            };
            appendElement();
        } else if (currentIon !== null && gotNumeric) {
            // Got a number for the ion, add number to last place
            currentIon.charge = currentIon.charge * 10 + parseInt(char);
        } else if (
            currentIon !== null &&
            currentIon.sign === 0 &&
            [43, 45].includes(charCode) &&
            (currentIon.charge === 0 ||
                (i !== rawString.length - 1 && rawString[i + 1] === "]"))
        ) {
            // If an ion has been started, a sign has not been given,
            // the char is at the start or end of the ion, received + or -
            currentIon.sign = charCode === 43 ? 1 : -1;
        } else if (currentIon !== null && char === "]") {
            // End ion bracket with ion charge entered
            const sign = currentIon.sign || 1;
            const charge = currentIon.charge * sign;

            const compoundSide = !reachedProducts ? reactants : products;
            const compound = compoundSide[compoundIndex];

            const compoundElements = Object.keys(compound);

            // Remove from compounds
            compoundSide.splice(compoundIndex, 1);

            const rawCompoundSide = !reachedProducts
                ? rawReactants
                : rawProducts;
            const rawCompound = rawCompoundSide[compoundIndex];
            const elementsSide = !reachedProducts
                ? reactantElements
                : productElements;
            // Remove from raw compounds
            rawCompoundSide.splice(compoundIndex, 1);

            const chargeString = Math.abs(charge)
                .toString()
                .concat(charge < 0 ? "-" : "+");

            // Add to ions at compoundIndex, to signify the ion will
            // be displayed before the compound at the next index
            ions[!reachedProducts ? 0 : 1][compoundIndex] = rawCompound.concat(
                "[",
                chargeString,
                "]"
            );

            for (let element of compoundElements) {
                // Remove from list of elements on that side
                elementsSide.splice(elementsSide.lastIndexOf(element));
            }

            // Decrement index for next compound(s)
            compoundIndex--;

            currentIon = null;
        } else {
            // Got an unexpected character, skip compound
            skipElement();
            continue;
        }

        if (i === rawString.length - 1) {
            // If last character is reached
            appendElement();
            multiplyElements();
        }
    }

    return {
        rawReactants,
        rawProducts,
        elements: [new Set(reactantElements), new Set(productElements)],
        // compounds,
        reactants,
        products,
        ions,
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

export const balanceEquation = (
    reactants: ChemicalCompound[],
    products: ChemicalCompound[]
) => {
    let balancingNumbers: [number[], number[]] = [
        new Array(reactants.length).fill(1),
        new Array(products.length).fill(1),
    ] as [number[], number[]];
    let reactantAtoms: { [key: string]: number } = {};
    let productAtoms: { [key: string]: number } = {};

    let reactantElements: string[][] = reactants.map(Object.keys);
    let productElements: string[][] = products.map(Object.keys);
    let elements = new Set<string>();
    let reactantElementCount: { [key: string]: number } = {};
    let productElementCount: { [key: string]: number } = {};
    let uniqueElements: string[] = [];

    const balanceCompound = (i: number, side: 0 | 1, element: string) => {
        const compound = (side === 0 ? reactants : products)[i];
        const sideAtoms = side === 0 ? reactantAtoms : productAtoms;
        const otherAtoms = side === 0 ? productAtoms : reactantAtoms;

        let oldBalancingNumber = balancingNumbers[side][i];
        let balancingNumber = oldBalancingNumber;

        // The amount of atoms on the side, excluding from the current compound
        const existingAtoms =
            sideAtoms[element] - balancingNumber * compound[element];
        balancingNumber =
            (otherAtoms[element] - existingAtoms) / compound[element];

        sideAtoms[element] =
            existingAtoms + balancingNumber * compound[element];

        // Update the amount of atoms for every other element in the compound
        for (let otherElement of Object.keys(compound)) {
            if (otherElement === element) continue;
            const otherExistingAtoms =
                sideAtoms[otherElement] -
                oldBalancingNumber * compound[otherElement];
            sideAtoms[otherElement] =
                otherExistingAtoms + balancingNumber * compound[otherElement];
        }

        balancingNumbers[side][i] = balancingNumber;

        // If balancing number is a decimal number
        if (balancingNumber % 1 < 1) {
            // Scale to a whole number
            const scale = hcf(balancingNumber, 1) / balancingNumber;

            for (let i = 0; i < balancingNumbers.length; i++) {
                const sideBalancingNumbers = balancingNumbers[i];

                for (let j = 0; j < sideBalancingNumbers.length; j++) {
                    balancingNumbers[i][j] *= scale;
                }
            }

            elements.forEach((element) => {
                reactantAtoms[element] *= scale;
                productAtoms[element] *= scale;
            });
        }

        // Update the balancing numbers on any compounds that
        // would have been affected because they contained a unique element
        if (uniqueElements.length > 0) {
            for (let key of Object.keys(compound)) {
                if (element === key) continue;
                if (!uniqueElements.includes(key)) return;
                const otherElements =
                    side === 0 ? productElements : reactantElements;

                for (let i = 0; i < otherElements.length; i++) {
                    const compoundElement = otherElements[i];
                    if (!compoundElement.includes(key)) continue;
                    balanceCompound(i, !side ? 1 : 0, key);
                }
            }
        }
    };

    // Couting the amount of atoms of an element on each side
    for (let reactant of reactants) {
        for (let [element, value] of Object.entries(reactant)) {
            elements.add(element);
            if (!reactantAtoms[element]) reactantAtoms[element] = 0;
            reactantAtoms[element] += value;
        }
    }

    for (let product of products) {
        for (let [element, value] of Object.entries(product)) {
            if (!productAtoms[element]) productAtoms[element] = 0;
            productAtoms[element] += value;
        }
    }

    for (let compoundElements of reactantElements) {
        for (let element of compoundElements) {
            if (!reactantElementCount[element])
                reactantElementCount[element] = 0;
            reactantElementCount[element]++;
        }
    }

    for (let compoundElements of productElements) {
        for (let element of compoundElements) {
            if (!productElementCount[element]) productElementCount[element] = 0;
            productElementCount[element]++;
        }
    }

    for (let i = 0; i < reactantElements.length; i++) {
        const reactantCompoundElements = reactantElements[i];

        for (let element of reactantCompoundElements) {
            if (
                !(
                    reactantElementCount[element] === 1 &&
                    productElementCount[element] === 1
                )
            )
                continue;
            uniqueElements.push(element);

            for (let j = 0; j < productElements.length; j++) {
                const productCompoundElements = productElements[j];
                if (!productCompoundElements.includes(element)) continue;

                // Balance the compound on the side with less
                if (
                    reactants[i][element] <= products[j][element] &&
                    balancingNumbers[0][i] <= balancingNumbers[1][j]
                ) {
                    balanceCompound(i, 0, element);
                } else {
                    balanceCompound(j, 1, element);
                }
            }
        }
    }

    elements.forEach((element) => {
        if (uniqueElements.includes(element)) return;

        let smallestCandidate: {
            side: 0 | 1;
            balancingNumber: number;
            value: number;
            numElements: number;
            index: number;
        } = {
            side: 0,
            balancingNumber: Infinity,
            value: Infinity,
            numElements: Infinity,
            index: 0,
        };

        // Find the compound with the smallest number of elements
        for (let i = 0; i < reactants.length; i++) {
            const reactant = reactants[i];
            const balancingNumber = balancingNumbers[0][i];
            const numElements = reactantElements[i].length;

            if (!reactantElements[i].includes(element)) continue;

            if (numElements >= smallestCandidate.numElements) continue;

            smallestCandidate = {
                side: 0,
                balancingNumber,
                value: reactant[element],
                numElements,
                index: i,
            };
        }

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const balancingNumber = balancingNumbers[1][i];
            const numElements = productElements[i].length;

            if (!productElements[i].includes(element)) continue;

            if (numElements >= smallestCandidate.numElements) continue;

            smallestCandidate = {
                side: 1,
                balancingNumber,
                value: product[element],
                numElements,
                index: i,
            };
        }

        balanceCompound(
            smallestCandidate.index,
            smallestCandidate.side,
            element
        );
    });

    return balancingNumbers;
};

// const algorithm1 = (
//     compounds: ChemicalCompound[],
//     productsStart: number
// ): [number[], number[]] => {
//     const balancingNumbers = new Array(compounds.length).fill(1);
//     const relationships: ChemicalCompoundRelationship[][] = [];
//     const mapped: number[][] = [];

//     // Initiate hash arrays
//     for (let i = 0; i < compounds.length; i++) {
//         relationships.push([]);
//         mapped.push([]);
//     }

//     const scaleWithRelationship = (
//         ratio: [number, number],
//         relationship: ChemicalCompoundRelationship,
//         from: number,
//         to: number,
//         depth = 0
//     ) => {
//         // Limit depth to prevent infinite recursion
//         if (depth >= 5) return;

//         let referenceRatio = ratio;
//         let relationshipRatio = relationship.ratio;

//         // Creating scales for both ratios via the shared element
//         const hcfValue = hcf(referenceRatio[0], relationshipRatio[0]);

//         const referenceScale = hcfValue / referenceRatio[0];
//         const relationshipScale = hcfValue / relationshipRatio[0];

//         referenceRatio = referenceRatio.map(
//             (value) => value * referenceScale
//         ) as [number, number];
//         relationshipRatio = relationshipRatio.map(
//             (value) => value * relationshipScale
//         ) as [number, number];

//         balancingNumbers[from] = referenceRatio[0];
//         balancingNumbers[to] = referenceRatio[1];
//         balancingNumbers[relationship.with] = relationshipRatio[1];

//         for (let newRelationship of relationships[relationship.with]) {
//             if (newRelationship.with === from) continue;
//             console.log(relationshipRatio);

//             scaleWithRelationship(
//                 [relationshipRatio[1], relationshipRatio[0]],
//                 newRelationship,
//                 relationship.with,
//                 from,
//                 depth + 1
//             );
//         }
//     };

//     for (let i = 0; i < compounds.length; i++) {
//         const compound = compounds[i];
//         const referenceElements = Object.keys(compound);

//         for (let j = 0; j < compounds.length; j++) {
//             // Skip past checking same compound
//             if (j === i) continue;

//             // Skip if the same pair of compounds has been checkedd#
//             if (mapped[i].includes(j)) continue;

//             const otherCompound = compounds[j];

//             for (let element of Object.keys(otherCompound)) {
//                 // Only consider the shared elements of compounds
//                 if (!referenceElements.includes(element)) continue;

//                 const hcfValue = hcf(compound[element], otherCompound[element]);

//                 // Calculating base ratio
//                 const newLeftNumber = hcfValue / compound[element];
//                 const newRightNumber = hcfValue / otherCompound[element];

//                 // If either compound already has relationships with other compounds
//                 // Note: The number for the reference element always goes at the start of the ratio
//                 if (relationships[i].length > 0) {
//                     for (let relationship of relationships[i]) {
//                         scaleWithRelationship(
//                             [newLeftNumber, newRightNumber],
//                             relationship,
//                             i,
//                             j
//                         );
//                     }
//                 }
//                 if (relationships[j].length > 0) {
//                     for (let relationship of relationships[j]) {
//                         scaleWithRelationship(
//                             [newRightNumber, newLeftNumber],
//                             relationship,
//                             j,
//                             i
//                         );
//                     }
//                 }

//                 // Simply overwrite balancing numbers
//                 if (
//                     relationships[i].length === 0 &&
//                     relationships[j].length === 0
//                 ) {
//                     balancingNumbers[i] = newLeftNumber;
//                     balancingNumbers[j] = newRightNumber;
//                 }

//                 relationships[i].push({
//                     with: j,
//                     ratio: [newLeftNumber, newRightNumber],
//                 });
//                 relationships[j].push({
//                     with: i,
//                     ratio: [newRightNumber, newLeftNumber],
//                 });
//             }
//         }
//     }

//     return [
//         balancingNumbers.slice(0, productsStart),
//         balancingNumbers.slice(productsStart),
//     ];
// };
