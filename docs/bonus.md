# Bonus — « Think HUGE »

Les étapes 1 à 4 sont terminées ? Choisissez un ou plusieurs défis. Ils sont **indépendants** et il n'y a pas de durée imposée.

```bash
npm run test:bonus     # tests des trois défis (rouges tant que vous n'avez rien écrit)
```

---

## Défi 1 — Minimiser le nombre de virements

### Objectif

Proposer le **plus petit nombre possible de virements** pour équilibrer tous les comptes.

### Notion

`computeTransfers` (fournie) est un algorithme **glouton** : à chaque tour, le plus gros débiteur rembourse le plus gros créancier. C'est simple et correct, mais pas toujours optimal.

Exemple : soldes `a −40`, `b +100`, `c −60`, `d +70`, `e +100`, `f −170`. Le glouton fait **5** virements. Pourtant `{a, b, c}` s'équilibrent entre eux (−40 + 100 − 60 = 0) et `{d, e, f}` aussi (70 + 100 − 170 = 0) : **2 + 2 = 4** virements suffisent.

Idée : un groupe de *k* personnes dont la somme des soldes vaut 0 se règle en *k − 1* virements. Minimiser les virements revient donc à **découper les membres en un maximum de groupes à somme nulle**.

### À faire

Dans `src/closure/balance-calculator.ts`, écrivez `minimizeTransfers(balances)` (cherchez `TODO bonus`) puis utilisez-la dans `calculateBalances` à la place de `computeTransfers`.

<details>
<summary>Indices</summary>

- Ignorez les membres dont le solde est 0.
- Avec peu de membres (≤ 20), essayez **tous** les sous-ensembles : un entier de 0 à 2ⁿ − 1 peut représenter un sous-ensemble (un bit par membre).
- Programmation dynamique : `groupes[masque]` = nombre maximum de groupes à somme nulle dans ce sous-ensemble. Pour chaque membre `i` du masque : `groupes[masque sans i] + (somme du masque === 0 ? 1 : 0)`.
- Une fois les groupes trouvés, réglez chacun avec `computeTransfers`.

</details>

📚 [Programmation dynamique sur les sous-ensembles (bitmask DP)](https://en.wikipedia.org/wiki/Dynamic_programming)

---

## Défi 2 — Pagination

### Objectif

`GET /wallets/:walletId/expenses?limit=2&offset=2` ne renvoie qu'une page de dépenses ; `totalAmount` reste le total de **tout** le porte-monnaie.

### Notion

Les paramètres d'URL (`@Query()`) sont des **textes** : `?limit=2` donne `"2"`. Avec un DTO de requête, `@Type(() => Number)` (class-transformer) convertit, puis `@IsInt()`, `@Min()`, `@Max()` valident. Prisma pagine avec `skip` et `take`.

### À faire

1. `src/expenses/dto/list-expenses-query.dto.ts` : `limit` (entier 1 à 100, 20 par défaut) et `offset` (entier ≥ 0, 0 par défaut), avec les décorateurs de validation.
2. `ExpensesController.findAll` : ajoutez `@Query() query: ListExpensesQueryDto` et transmettez-le au service.
3. `ExpensesService.findAll` : utilisez `skip` et `take` dans `findMany`.

<details>
<summary>Indices</summary>

- Si `?limit=abc` renvoie 200 au lieu de 400 : pensez à `@Type(() => Number)` **et** `@IsInt()`.
- La valeur par défaut se donne dans la classe : `limit: number = 20;`.
- Allez plus loin : renvoyer aussi le nombre total de dépenses (`prisma.expense.count`) ou passer à une pagination par **curseur**.

</details>

📚 [Query params et validation](https://docs.nestjs.com/techniques/validation#transform-payload-objects) · [Pagination Prisma](https://www.prisma.io/docs/orm/prisma-client/queries/pagination)

---

## Défi 3 — Un Interceptor qui mesure le temps

### Objectif

Ajouter à **chaque réponse** un en-tête `X-Response-Time: 12ms` et écrire la durée dans les logs.

### Notion

Un **Interceptor** s'exécute **avant et après** la méthode du contrôleur : il peut mesurer, transformer la réponse, mettre en cache… Il reçoit `next.handle()`, un flux RxJS (`Observable`) de la réponse ; l'opérateur `tap` permet d'agir sans la modifier.

```ts
// logging.interceptor.ts — exemple (pas la solution)
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    console.log('Avant la méthode…');
    return next.handle().pipe(
      tap(() => console.log('Après la méthode.')),
    );
  }
}
```

### À faire

1. `src/common/interceptors/timing.interceptor.ts` : mesurez la durée (`Date.now()` avant / après), posez l'en-tête avec `context.switchToHttp().getResponse().setHeader(...)`, et loguez avec un `Logger` de Nest.
2. Enregistrez-le globalement dans `src/main.ts` : `app.useGlobalInterceptors(new TimingInterceptor())`.
3. Vérifiez avec `curl -i http://localhost:3000/` : l'en-tête doit apparaître.

📚 [Interceptors](https://docs.nestjs.com/interceptors) · [RxJS `tap`](https://rxjs.dev/api/index/function/tap)

---

## Pour aller plus loin

- Ajouter `PATCH /wallets/:walletId/expenses/:id` (titre et montant) en réutilisant `ExpenseOwnerGuard`.
- Écrire vos propres tests pour un nouveau comportement.
- Paginer par curseur plutôt que par `offset` : pourquoi est-ce plus robuste quand de nouvelles dépenses arrivent pendant la lecture ?

## Bloqué ?

```bash
npm run rattrapage -- bonus
```
