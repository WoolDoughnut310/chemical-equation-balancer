import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders title", () => {
    render(<App />);
    const titleElement = screen.getByText(/Created by Joseph Nma./i);
    expect(titleElement).toBeInTheDocument();
});
