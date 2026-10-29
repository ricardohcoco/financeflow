// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import TransactionForm from "./index";

import type { Category } from "../../types/category";
import type { TransactionFormData } from "../../types/transaction";

const categories: Category[] = [
  { id: 1, name: "Salário", type: "receita" },
  { id: 2, name: "Freelance", type: "receita" },
  { id: 5, name: "Alimentação", type: "despesa" },
  { id: 6, name: "Moradia", type: "despesa" },
];

const validTransaction: TransactionFormData = {
  description: "Compras no mercado",
  amount: "185.90",
  type: "despesa",
  category_id: 5,
  date: "2026-10-28",
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("TransactionForm", () => {
  it("renderiza os campos para um novo cadastro", () => {
    render(
      <TransactionForm
        categories={categories}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Descrição")).toBeTruthy();

    expect(screen.getByLabelText("Valor (R$)")).toBeTruthy();

    expect(screen.getByLabelText("Tipo")).toBeTruthy();

    expect(screen.getByLabelText("Categoria")).toBeTruthy();

    expect(screen.getByLabelText("Data")).toBeTruthy();

    expect(screen.getByRole("button", { name: "Cadastrar" })).toBeTruthy();
  });

  it("não envia um formulário com descrição vazia", () => {
    const onSave = vi.fn();

    render(
      <TransactionForm
        categories={categories}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    expect(screen.getByRole("alert").textContent).toContain(
      "Informe uma descrição",
    );

    expect(onSave).not.toHaveBeenCalled();
  });

  it("não permite cadastrar um valor negativo", () => {
    const onSave = vi.fn();

    render(
      <TransactionForm
        categories={categories}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Descrição"), {
      target: { value: "Supermercado" },
    });

    fireEvent.change(screen.getByLabelText("Valor (R$)"), {
      target: { value: "-50.00" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    expect(screen.getByRole("alert").textContent).toContain(
      "Informe um valor positivo",
    );

    expect(onSave).not.toHaveBeenCalled();
  });

  it("limpa a categoria ao alternar entre tipos", () => {
  render(
    <TransactionForm
      categories={categories}
      onSave={vi.fn()}
      onCancel={vi.fn()}
    />
  );

  const typeSelect = screen.getByLabelText(
    "Tipo"
  ) as HTMLSelectElement;

  const categorySelect = screen.getByLabelText(
    "Categoria"
  ) as HTMLSelectElement;

  fireEvent.change(categorySelect, {
    target: { value: "5" },
  });

  expect(categorySelect.value).toBe("5");

  fireEvent.change(typeSelect, {
    target: { value: "receita" },
  });

  expect(
    screen.queryByRole("option", {
      name: "Alimentação",
    })
  ).toBeNull();

  expect(
    screen.getByRole("option", {
      name: "Salário",
    })
  ).toBeTruthy();

  expect(categorySelect.value).toBe("0");

  fireEvent.change(typeSelect, {
    target: { value: "despesa" },
  });

  expect(categorySelect.value).toBe("0");
});

  it("envia os dados válidos através de onSave", () => {
    const onSave = vi.fn();

    render(
      <TransactionForm
        categories={categories}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Descrição"), {
      target: { value: "  Compras no mercado  " },
    });

    fireEvent.change(screen.getByLabelText("Valor (R$)"), {
      target: { value: "185.90" },
    });

    fireEvent.change(screen.getByLabelText("Categoria"), {
      target: { value: "5" },
    });

    fireEvent.change(screen.getByLabelText("Data"), {
      target: { value: "2026-10-28" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(validTransaction);
  });

  it("preenche o formulário com os dados de edição", () => {
    render(
      <TransactionForm
        categories={categories}
        initialData={validTransaction}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect((screen.getByLabelText("Descrição") as HTMLInputElement).value).toBe(
      "Compras no mercado",
    );

    expect(
      (screen.getByLabelText("Valor (R$)") as HTMLInputElement).value,
    ).toBe("185.90");

    expect(
      screen.getByRole("button", {
        name: "Salvar alterações",
      }),
    ).toBeTruthy();
  });

  it("desabilita o envio durante o salvamento", () => {
    render(
      <TransactionForm
        categories={categories}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        saving
      />,
    );

    expect(
      (
        screen.getByRole("button", {
          name: "Salvando...",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);

    expect(
      (screen.getByLabelText("Descrição") as HTMLInputElement).disabled,
    ).toBe(true);
  });
});
