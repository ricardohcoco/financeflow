import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import express from "express";
import { AppError } from "../errors/AppError.js";
import { errorMiddleware } from "../middlewares/errorMiddleware.js";
import { notFoundMiddleware } from "../middlewares/notFoundMiddleware.js";

const app = express();

app.use(express.json());

app.get("/test/app-error", (_req, _res, next) => {
  next(new AppError(409, "Conflito conhecido."));
});

app.get("/test/connection-refused", (_req, _res, next) => {
  next(
    Object.assign(new Error("Falha na conexão"), {
      code: "ECONNREFUSED",
    }),
  );
});

app.get("/test/database-connection", (_req, _res, next) => {
  next(
    Object.assign(new Error("Falha PostgreSQL"), {
      code: "08006",
    }),
  );
});

app.get("/test/sql-error", (_req, _res, next) => {
  next(
    Object.assign(new Error("Erro de SQL"), {
      code: "42P08",
    }),
  );
});

app.get("/test/internal-error", (_req, _res, next) => {
  next(new Error("SEGREDO_INTERNO_NAO_EXIBIR"));
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

let server: Server;
let baseUrl: string;

before(async () => {
  server = await new Promise<Server>((resolve) => {
    const instance = app.listen(0, "127.0.0.1", () => {
      resolve(instance);
    });
  });

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Não foi possível obter a porta do teste.");
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
    if (server) {
        await new Promise<void>((resolve, reject) => {
            server.close((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
});

test("retorna 404 para rota inexistente", async () => {
    const response = await fetch(`${baseUrl}/nao-existe`);
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.deepEqual(body, {
        message: "Rota não encontrada.",
    });
});

test("retorna 400 para JSON malformado", async () => {
    const response = await fetch(`${baseUrl}/test/app-error`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: '{"name":',
    });

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.deepEqual(body, {
        message: "JSON inválido na requisição.",
    });
});

test("preserva o status de AppError", async () => {
    const response = await fetch(`${baseUrl}/test/app-error`);
    const body = await response.json();

    assert.equal(response.status, 409);
    assert.deepEqual(body, {
        message: "Conflito conhecido.",
    });
});

test("retorn 503 para conexão recusada", async () => {
    const response = await fetch(
        `${baseUrl}/test/connection-refused`
    );

    const body = await response.json();

    assert.equal(response.status, 503);
    assert.deepEqual(body, {
        message: "Serviço temporariamente indisponível.",
    });
});

test("retorna 503 para falha de conexão PostgreSQL", async () => {
  const response = await fetch(
    `${baseUrl}/test/database-connection`
  );

  assert.equal(response.status, 503);
});

test("retorn 500 para erro SQL", async () => {
    const response = await fetch(`${baseUrl}/test/sql-error`);

    assert.equal(response.status, 500);
});

test("não expõe detalhes de erros internos", async () => {
    const response = await fetch(`${baseUrl}/test/internal-error`);

    const body = await response.json();

    assert.equal(response.status, 500);
    assert.deepEqual(body, {
        message: "Ocorreu um erro interno no servidor.",
    });

    assert.equal(
        JSON.stringify(body).includes("SEGREDO_INTERNO_NAO_EXIBIR"),
        false
    );
});
