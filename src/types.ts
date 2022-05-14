export const SPLIT = "->";
export type ChemicalCompound = { [key: string]: number };
export enum Errors {
    INVALID_ELEMENT = "invalid",
    IMPOSSIBLE = "impossible",
}
export type ChemicalCompoundRelationship = {
    with: number;
    ratio: [number, number];
};
