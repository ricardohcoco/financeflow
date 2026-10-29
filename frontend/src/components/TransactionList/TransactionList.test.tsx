// @vitest-environment jsdom

import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import TransactionList from "./index";
import type { Transaction } from "../../types/transaction";

const transactions: Transaction[] = [
  {
    id: 10,
    description: "Salário",
    amount: "5000.00",
    type: "receita",
    category_id: 1,
    category_name: "Salário",
    date: "2026-10-20",
  },
  {
    id: 11,
    description: "Supermercado",
    amount: "185.90",
    type: "despesa",
    category_id: 5,
    category_name: "Alimentação",
    date: "2026-10-28",
  },
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("TransactionList", () => {
  it("apresenta uma mensagem quando a lista está vazia", () => {
    render(<TransactionList transactions={[]} />);

    expect(
      screen.getByText("Nenhuma movimentação encontrada.")
    ).toBeTruthy();
  });

  it("exibe as movimentações e seus valores formatados", () => {
    render(
      <TransactionList transactions={transactions} />
    );

    expect(screen.getAllByText("Salário").length)
      .toBeGreaterThan(0);

    expect(
      screen.getByText("Supermercado")
    ).toBeTruthy();

    expect(
      screen.getByText("+ R$ 5.000,00")
    ).toBeTruthy();

    expect(
      screen.getByText("- R$ 185,90")
    ).toBeTruthy();
  });

  it("comunica corretamente as ações de edição e exclusão", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TransactionList
        transactions={transactions}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Editar Supermercado",
      })
    );

    expect(onEdit).toHaveBeenCalledWith(
      transactions[1]
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Excluir Supermercado",
      })
    );

    expect(onDelete).toHaveBeenCalledWith(11);
  });
});
