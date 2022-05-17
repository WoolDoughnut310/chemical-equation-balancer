import { balanceEquation } from "./util";
import { ChemicalCompound } from "./types";

describe("balancing equations", () => {
    test("balancin test 0", () => {
        const reactants: ChemicalCompound[] = [{ H: 2 }, { O: 2 }];
        const products: ChemicalCompound[] = [{ H: 2, O: 1 }];

        expect(balanceEquation(reactants, products)).toEqual([[2, 1], [2]]);
    });

    test("balancing test 1", () => {
        const reactants: ChemicalCompound[] = [
            { C: 1, O: 2 },
            { H: 2, O: 1 },
        ];
        const products: ChemicalCompound[] = [{ C: 6, H: 12, O: 6 }, { O: 2 }];

        expect(balanceEquation(reactants, products)).toEqual([
            [6, 6],
            [1, 6],
        ]);
    });

    test("balancing test 2", () => {
        const reactants: ChemicalCompound[] = [
            { Si: 1, Cl: 4 },
            { H: 2, O: 1 },
        ];
        const products: ChemicalCompound[] = [
            { H: 4, Si: 1, O: 4 },
            { H: 1, Cl: 1 },
        ];

        expect(balanceEquation(reactants, products)).toEqual([
            [1, 4],
            [1, 4],
        ]);
    });

    test("balancing test 3", () => {
        const reactants: ChemicalCompound[] = [{ Al: 1 }, { H: 1, Cl: 1 }];
        const products: ChemicalCompound[] = [{ Al: 1, Cl: 3 }, { H: 2 }];

        expect(balanceEquation(reactants, products)).toEqual([
            [2, 6],
            [2, 3],
        ]);
    });

    test("balancing test 4", () => {
        const reactants: ChemicalCompound[] = [
            { Na: 2, C: 1, O: 3 },
            { H: 1, Cl: 1 },
        ];
        const products: ChemicalCompound[] = [
            { Na: 1, Cl: 1 },
            { H: 2, O: 1 },
            { C: 1, O: 2 },
        ];

        expect(balanceEquation(reactants, products)).toEqual([
            [1, 2],
            [2, 1, 1],
        ]);
    });

    test("balancing test 5", () => {
        const reactants: ChemicalCompound[] = [{ C: 7, H: 6, O: 2 }, { O: 2 }];
        const products: ChemicalCompound[] = [
            { C: 1, O: 2 },
            { H: 2, O: 1 },
        ];

        expect(balanceEquation(reactants, products)).toEqual([
            [2, 15],
            [14, 6],
        ]);
    });

    test("balancing test 6", () => {
        const reactants: ChemicalCompound[] = [
            { Fe: 2, S: 3, O: 12 },
            { K: 1, O: 1, H: 1 },
        ];
        const products: ChemicalCompound[] = [
            { K: 2, S: 1, O: 4 },
            { Fe: 1, O: 3, H: 3 },
        ];

        expect(balanceEquation(reactants, products)).toEqual([
            [1, 6],
            [3, 2],
        ]);
    });

    test("balancing test 7", () => {
        const reactants: ChemicalCompound[] = [
            { Ca: 3, P: 2, O: 8 },
            { Si: 1, O: 2 },
        ];
        const products: ChemicalCompound[] = [
            { P: 4, O: 10 },
            { Ca: 1, Si: 1, O: 3 },
        ];

        expect(balanceEquation(reactants, products)).toEqual([
            [2, 6],
            [1, 6],
        ]);
    });

    test("balancing test 8", () => {
        const reactants: ChemicalCompound[] = [{ K: 1, Cl: 1, O: 3 }];
        const products: ChemicalCompound[] = [
            { K: 1, Cl: 1, O: 4 },
            { K: 1, Cl: 1 },
        ];

        expect(balanceEquation(reactants, products)).toEqual([[4], [3, 1]]);
    });

    test("balancing test 9", () => {
        const reactants: ChemicalCompound[] = [
            { Al: 2, S: 3, O: 12 },
            { Ca: 1, O: 2, H: 2 },
        ];
        const products: ChemicalCompound[] = [
            { Al: 1, O: 3, H: 3 },
            { Ca: 1, S: 1, O: 4 },
        ];

        expect(balanceEquation(reactants, products)).toEqual([
            [1, 3],
            [2, 3],
        ]);
    });

    test("balancing test 10", () => {
        const reactants: ChemicalCompound[] = [
            { H: 2, S: 1, O: 4 },
            { H: 1, I: 1 },
        ];
        const products: ChemicalCompound[] = [
            { H: 2, S: 1 },
            { I: 2 },
            { H: 2, O: 1 },
        ];

        expect(balanceEquation(reactants, products)).toEqual([
            [1, 8],
            [1, 4, 4],
        ]);
    });
});
