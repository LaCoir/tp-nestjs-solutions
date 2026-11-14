# Étape 3 — Supprimer une dépense : Guard et décorateur personnalisé

⏱️ 20 minutes · Notion : **Guard, décorateur `@CurrentUser()`, `ForbiddenException`**

## 1. Objectif

Écrire `DELETE /wallets/:walletId/expenses/:id` : seul le **dépenseur** ou le **créateur** de la dépense peut la supprimer (sinon `403`), grâce à un `ExpenseOwnerGuard` et à un décorateur `@CurrentUser()`.

## 2. Notion NestJS

### Le Guard

Un **Guard** est exécuté **avant** la méthode du contrôleur et décide si la requête peut continuer. C'est une classe qui implémente `CanActivate` :

- si `canActivate` renvoie `true` → la requête continue ;
- si elle lève une exception (`ForbiddenException`, `NotFoundException`…) → Nest répond avec le code HTTP correspondant et la méthode n'est **pas** appelée.

Un guard peut être injecté comme un service (il reçoit `PrismaService` dans son constructeur) et s'applique avec `@UseGuards(...)`, sur une classe entière ou sur **une seule méthode**. Vous connaissez déjà `JwtAuthGuard`, posé sur la classe : il vérifie le jeton et remplit `request.user`.

```ts
// project-member.guard.ts — exemple sur un autre sujet (pas la solution)
@Injectable()
export class ProjectMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { projectId } = request.params;       // paramètres de l'URL
    const { userId } = request.user;            // rempli par JwtAuthGuard

    const member = await this.prisma.projectMember.findFirst({
      where: { projectId, userId },
    });
    if (!member) {
      throw new ForbiddenException('Vous ne faites pas partie de ce projet.');
    }
    return true;
  }
}

// Sur UNE route :
@Delete(':projectId')
@UseGuards(ProjectMemberGuard)
remove(@Param('projectId') projectId: string) { /* … */ }
```

### Le décorateur de paramètre

Écrire `@Req() request` puis `request.user.userId` est répétitif. Avec `createParamDecorator`, on fabrique son propre décorateur de paramètre :

```ts
// current-locale.decorator.ts — exemple (pas la solution)
export const CurrentLocale = createParamDecorator(
  (suffix: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const locale = request.headers['accept-language'] ?? 'fr';
    return suffix ? `${locale}${suffix}` : locale;   // 1er argument = ce qu'on met entre parenthèses
  },
);

// Utilisation : @CurrentLocale() ou @CurrentLocale('-FR')
hello(@CurrentLocale() locale: string) { /* … */ }
```

📚 Documentation officielle : [Guards](https://docs.nestjs.com/guards) · [Décorateurs personnalisés](https://docs.nestjs.com/custom-decorators) · [Filtres d'exceptions (codes HTTP)](https://docs.nestjs.com/exception-filters)

## 3. À faire

Cherchez `TODO étape 3`.

1. **`src/auth/decorators/current-user.decorator.ts`** — complétez `@CurrentUser()` :
   - `@CurrentUser()` renvoie `request.user` (c'est-à-dire `{ userId }`) ;
   - `@CurrentUser('userId')` renvoie directement `request.user.userId`.
2. **`src/expenses/guards/expense-owner.guard.ts`** — complétez `canActivate` :
   1. lire `walletId` et `id` dans `request.params`, et `userId` dans `request.user` ;
   2. chercher la dépense avec `this.prisma.expense.findFirst({ where: { id, walletId }, ... })` ;
   3. introuvable → `NotFoundException` ;
   4. ni dépenseur (`paidById`) ni créateur (`createdById`) → `ForbiddenException` ;
   5. sinon renvoyer `true`.
3. **`src/expenses/expenses.service.ts`** — écrivez `remove(walletId, expenseId)` (l'autorisation est faite par le guard, pas ici) :
   - le porte-monnaie doit exister (`NotFoundException`) et être ouvert (`assertWalletOpen`) ;
   - supprimer la dépense (`this.prisma.expense.delete`) ;
   - mettre à jour `updatedAt` du porte-monnaie.
4. **`src/expenses/expenses.controller.ts`** :
   - ajoutez la route `@Delete(':id')` avec `@UseGuards(ExpenseOwnerGuard)` et `@HttpCode(HttpStatus.NO_CONTENT)` (réponse `204`, sans corps) ;
   - **refactorisez** `findAll` et `create` pour utiliser `@CurrentUser('userId') userId: string` à la place de `@Req()`.

## 4. Indices

<details>
<summary>Indice 1 — le décorateur</summary>

```ts
export const CurrentUser = createParamDecorator(
  (field: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    // si `field` est fourni → request.user[field], sinon → request.user
  },
);
```

</details>

<details>
<summary>Indice 2 — structure du guard</summary>

```ts
const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
const { walletId, id } = request.params as Record<string, string>;
const { userId } = request.user;

const expense = await this.prisma.expense.findFirst({
  where: { id, walletId },
  select: { paidById: true, createdById: true },
});
```

</details>

<details>
<summary>Indice 3 — pourquoi chercher avec <code>{ id, walletId }</code> et pas seulement <code>id</code> ?</summary>

Une dépense d'un *autre* porte-monnaie ne doit pas être supprimable via l'URL de celui-ci. Avec les deux critères, elle est « introuvable » (404).

</details>

<details>
<summary>Indice 4 — la condition de refus</summary>

On refuse si l'utilisateur n'est **ni** le dépenseur **ni** le créateur : `expense.paidById !== userId && expense.createdById !== userId`.

</details>

<details>
<summary>Indice 5 — le guard n'est pas appelé (le test attend 403 mais reçoit 204)</summary>

Vérifiez `@UseGuards(ExpenseOwnerGuard)` **sur la méthode** `remove` et l'import de `ExpenseOwnerGuard` avec son `.js`.

</details>

<details>
<summary>Indice 6 — « Nest can't resolve dependencies of the ExpenseOwnerGuard »</summary>

Le guard doit être `@Injectable()` et son constructeur doit déclarer `PrismaService` avec son type (c'est déjà le cas dans le squelette fourni : ne le modifiez pas).

</details>

## 5. ✅ Checkpoint

```bash
npm run test:etape3
```

Avec Swagger, à **deux utilisateurs** (créez un second compte, invitez-le, acceptez l'invitation — voir [la fiche d'installation](00-installation.md)) :

1. Alice déclare une dépense (étape 2) ;
2. Bob (autre membre) tente `DELETE /wallets/{walletId}/expenses/{id}` → `403` ;
3. Alice relance → `204`, puis `GET` : la dépense a disparu.

```bash
curl -i -X DELETE http://localhost:3000/wallets/<walletId>/expenses/<expenseId> \
  -H "Authorization: Bearer <accessToken>"
```

## 6. Bloqué ?

```bash
npm run rattrapage -- 3
```

Récupère le code de la fin de l'étape 3. Ensuite : [étape 4](etape-4.md).
