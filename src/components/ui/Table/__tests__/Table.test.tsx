import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Table } from "../Table";

describe("Table", () => {
  it("renders the classic two-column label/value rows", () => {
    render(
      <Table
        columnHeaders={["Journey", "Time"]}
        rows={[{ label: "the Crossroads", value: "3-4 hours" }]}
      />,
    );
    expect(screen.getByText("Journey")).toBeInTheDocument();
    expect(screen.getByText("the Crossroads")).toBeInTheDocument();
    expect(screen.getByText("3-4 hours")).toBeInTheDocument();
  });

  it("renders an N-column header row", () => {
    render(
      <Table
        columnHeaders={["1d4", "Purpose", "Cost"]}
        rows={[{ id: "r1", cells: ["1", "To punish", "Victory"] }]}
      />,
    );
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
    expect(screen.getByText("To punish")).toBeInTheDocument();
  });

  it("calls onSelect when a selectable row is chosen", () => {
    const onSelect = vi.fn();
    render(
      <Table
        columnHeaders={["1d4", "Purpose", "Cost"]}
        selectionLabel="purpose"
        rows={[
          {
            id: "r1",
            cells: ["1", "To punish", "Victory"],
            ariaLabel: "1 To punish Victory",
            selectable: true,
            selected: false,
            onSelect,
          },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("radio"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("marks the selected row's radio as checked", () => {
    render(
      <Table
        columnHeaders={["1d4", "Purpose", "Cost"]}
        rows={[
          { id: "r1", cells: ["1", "To punish", "Victory"], ariaLabel: "1 To punish Victory", selectable: true, selected: false, onSelect: () => {} },
          { id: "r2", cells: ["2", "To preserve", "Hoard"], ariaLabel: "2 To preserve Hoard", selectable: true, selected: true, onSelect: () => {} },
        ]}
      />,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).not.toBeChecked();
    expect(radios[1]).toBeChecked();
  });

  it("disables the radio when a selectable row is disabled", () => {
    const onSelect = vi.fn();
    render(
      <Table
        columnHeaders={["1d4", "Purpose", "Cost"]}
        rows={[
          {
            id: "r1",
            cells: ["1", "To punish", "Victory"],
            ariaLabel: "1 To punish Victory",
            selectable: true,
            disabled: true,
            onSelect,
          },
        ]}
      />,
    );
    expect(screen.getByRole("radio")).toBeDisabled();
  });

  it("exposes a radiogroup with its accessible name when rows are selectable", () => {
    render(
      <Table
        selectionLabel="1d4 Purpose Cost"
        rows={[{ id: "r1", cells: ["1", "To punish"], ariaLabel: "1 To punish", selectable: true, onSelect: () => {} }]}
      />,
    );
    expect(
      screen.getByRole("radiogroup", { name: "1d4 Purpose Cost" }),
    ).toBeInTheDocument();
    // The row's radio carries its own accessible name from ariaLabel, so a screen reader announces
    // the option, not just the group.
    expect(screen.getByRole("radio", { name: "1 To punish" })).toBeInTheDocument();
  });
});
