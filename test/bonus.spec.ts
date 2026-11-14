// Bonus — « Think HUGE » (facultatif)
// Lancer : npm run test:bonus
//
// Trois défis indépendants :
//   1. minimizeTransfers  (src/closure/balance-calculator.ts)
//   2. pagination ?limit=&offset= (src/expenses/dto/list-expenses-query.dto.ts + service + contrôleur)
//   3. TimingInterceptor  (src/common/interceptors/timing.interceptor.ts)
import 'reflect-metadata';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { lastValueFrom, of } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import {
  computeTransfers,
  minimizeTransfers,
  type Transfer,
} from '../src/closure/balance-calculator.js';
import { TimingInterceptor } from '../src/common/interceptors/timing.interceptor.js';
import { ExpensesModule } from '../src/expenses/expenses.module.js';
import {
  ALICE,
  createTestApp,
  expectStatus,
  sampleData,
  type TestApp,
} from './support/test-app.js';

function settle(balances: { userId: string; balance: number }[], transfers: Transfer[]) {
  const remaining = Object.fromEntries(balances.map((row) => [row.userId, row.balance]));
  for (const transfer of transfers) {
    remaining[transfer.fromUserId] += transfer.amount;
    remaining[transfer.toUserId] -= transfer.amount;
  }
  return remaining;
}

describe('Bonus 1 — minimizeTransfers (moins de virements possible)', () => {
  // Deux groupes indépendants : {a, b, c} (−40 +100 −60) et {d, e, f} (+70 +100 −170).
  // Minimum : 2 + 2 = 4 virements. Le glouton en propose 5.
  const balances = [
    { userId: 'a', balance: -4000 },
    { userId: 'b', balance: 10000 },
    { userId: 'c', balance: -6000 },
    { userId: 'd', balance: 7000 },
    { userId: 'e', balance: 10000 },
    { userId: 'f', balance: -17000 },
  ];

  it('le glouton de départ (computeTransfers) fait 5 virements sur cet exemple', () => {
    expect(computeTransfers(balances).length).toBe(5);
  });

  it('minimizeTransfers solde tous les comptes', () => {
    const transfers = minimizeTransfers(balances);
    const remaining = settle(balances, transfers);
    expect(
      Object.values(remaining).every((value) => value === 0),
      `Après les virements, tous les soldes devraient être 0 — reçu : ${JSON.stringify(remaining)}`,
    ).toBe(true);
  });

  it('minimizeTransfers trouve le minimum : 4 virements (et non 5)', () => {
    const transfers = minimizeTransfers(balances);
    expect(
      transfers.length,
      `Nombre de virements attendu : 4 — reçu : ${transfers.length}. Cherchez les sous-groupes dont la somme des soldes vaut 0.`,
    ).toBe(4);
  });

  it('aucun virement quand tout le monde est à 0', () => {
    expect(minimizeTransfers([{ userId: 'a', balance: 0 }, { userId: 'b', balance: 0 }])).toEqual([]);
  });

  it('deux personnes : un seul virement', () => {
    expect(
      minimizeTransfers([
        { userId: 'a', balance: 500 },
        { userId: 'b', balance: -500 },
      ]),
    ).toEqual([{ fromUserId: 'b', toUserId: 'a', amount: 500 }]);
  });
});

describe('Bonus 2 — pagination de GET /wallets/:walletId/expenses', () => {
  let testApp: TestApp;

  afterEach(async () => {
    await testApp?.app.close();
  });

  async function start() {
    testApp = await createTestApp({ imports: [ExpensesModule], data: sampleData() });
    return request(testApp.app.getHttpServer());
  }

  const titles = (body: { items: { title: string }[] }) => body.items.map((item) => item.title);

  it('?limit=2 renvoie seulement les 2 premières dépenses (les plus récentes)', async () => {
    const http = await start();
    const response = await http.get('/wallets/w-open/expenses?limit=2').set('x-test-user', ALICE);

    expectStatus(response, 200, 'La route doit accepter ?limit.');
    expect(
      response.body.items.length,
      `2 éléments attendus — reçus : ${response.body.items.length}`,
    ).toBe(2);
  });

  it('?limit=2&offset=2 renvoie la dépense suivante (la plus ancienne)', async () => {
    const http = await start();
    const response = await http
      .get('/wallets/w-open/expenses?limit=2&offset=2')
      .set('x-test-user', ALICE);

    expectStatus(response, 200, 'La route doit accepter ?offset.');
    expect(titles(response.body), 'Attendu : la 3e dépense, « Courses ».').toEqual(['Courses']);
  });

  it('le total concerne tout le porte-monnaie, pas seulement la page', async () => {
    const http = await start();
    const response = await http.get('/wallets/w-open/expenses?limit=1').set('x-test-user', ALICE);

    expect(
      response.body.totalAmount,
      `totalAmount attendu : 9099 (toutes les dépenses) — reçu : ${response.body.totalAmount}`,
    ).toBe(9099);
  });

  it('sans paramètre : toutes les dépenses (limite par défaut 20)', async () => {
    const http = await start();
    const response = await http.get('/wallets/w-open/expenses').set('x-test-user', ALICE);

    expect(response.body.items.length).toBe(3);
  });

  it.each(['limit=0', 'limit=101', 'limit=abc', 'offset=-1'])(
    'refuse (400) le paramètre invalide « %s »',
    async (query) => {
      const http = await start();
      const response = await http
        .get(`/wallets/w-open/expenses?${query}`)
        .set('x-test-user', ALICE);

      expectStatus(response, 400, 'Validez les paramètres avec class-validator (@IsInt, @Min, @Max).');
    },
  );
});

describe('Bonus 3 — TimingInterceptor', () => {
  function context(response: { setHeader: (name: string, value: string) => void }) {
    return {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => ({ method: 'GET', url: '/test' }),
      }),
    } as unknown as ExecutionContext;
  }

  it('laisse passer la réponse inchangée', async () => {
    const headers: Record<string, string> = {};
    const handler: CallHandler = { handle: () => of({ ok: true }) };
    const result = await lastValueFrom(
      new TimingInterceptor().intercept(
        context({ setHeader: (name, value) => (headers[name] = value) }),
        handler,
      ),
    );

    expect(result, 'L’intercepteur ne doit pas modifier le corps de la réponse.').toEqual({ ok: true });
  });

  it('ajoute l’en-tête X-Response-Time au format « 12ms »', async () => {
    const headers: Record<string, string> = {};
    const handler: CallHandler = { handle: () => of('ok') };
    await lastValueFrom(
      new TimingInterceptor().intercept(
        context({ setHeader: (name, value) => (headers[name] = value) }),
        handler,
      ),
    );

    expect(
      headers['X-Response-Time'],
      `En-tête « X-Response-Time » attendu au format « <nombre>ms » — reçu : ${JSON.stringify(headers)}`,
    ).toMatch(/^\d+ms$/);
  });
});
