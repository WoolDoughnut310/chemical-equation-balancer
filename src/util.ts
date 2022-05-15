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
    reversible: boolean | null;
} => {
    // const compounds: ChemicalCompound[] = [];
    const reactants: ChemicalCompound[] = [];
    const products: ChemicalCompound[] = [];

    const rawReactants: string[] = [];
    const rawProducts: string[] = [];
    const reactantElements = new Set<string>();
    const productElements = new Set<string>();
    let reachedProducts = false;
    let compoundIndex = 0;
    let element = "";
    let elementValue = "";
    let reversible: null | boolean = null;

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
        elementsSide.add(element);

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

    const skipElement = () => {
        element = "";
        elementValue = "";
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
        } else if (element !== "" && !isNaN(parseInt(char))) {
            // Got a number for element value
            elementValue = elementValue.concat(char);
        } else {
            console.log("hahah");
            console.log(element, elementValue);
            // Got an unexpected character, skip compound
            skipElement();
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
        // compounds,
        reactants,
        products,
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
        const existingAtoms =
            sideAtoms[element] - balancingNumber * compound[element];
        balancingNumber =
            (otherAtoms[element] - existingAtoms) / compound[element];

        sideAtoms[element] =
            existingAtoms + balancingNumber * compound[element];

        for (let otherElement of Object.keys(compound)) {
            if (otherElement === element) continue;
            const otherExistingAtoms =
                sideAtoms[otherElement] -
                oldBalancingNumber * compound[otherElement];
            sideAtoms[otherElement] =
                otherExistingAtoms + balancingNumber * compound[otherElement];
        }

        balancingNumbers[side][i] = balancingNumber;

        if (balancingNumber % 1 < 1) {
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

                if (reactants[i][element] < products[j][element]) {
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
