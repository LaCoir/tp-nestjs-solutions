# TP NestJS — « Les bons comptes »

Atelier de 2 heures · Master 2 MIAGE · Université de Lille · UE *Infrastructures & Frameworks*

« Les bons comptes » est une application de gestion de **porte-monnaie partagé** : des amis créent un porte-monnaie, s'invitent, déclarent leurs dépenses, puis **clôturent** le porte-monnaie pour savoir qui doit rembourser qui. Le backend est écrit avec **NestJS** (TypeScript) et une base **PostgreSQL** hébergée sur **Neon**.

Une partie de l'application est déjà écrite (comptes, porte-monnaies, invitations). **Vous écrivez la gestion des dépenses et le calcul de la clôture**, étape par étape.

## Objectifs

À la fin de l'atelier, vous saurez :

- lire la structure d'un projet NestJS (modules, contrôleurs, services) ;
- utiliser l'**injection de dépendances** ;
- valider des données entrantes avec des **DTO** et `class-validator` ;
- protéger une route avec un **Guard** et créer un **décorateur personnalisé** ;
- écrire une **logique métier** testée (calcul de soldes en centimes) ;
- tester une API NestJS avec **Vitest** (même API que Jest : `describe`, `it`, `expect`).

## Prérequis

- Node.js **22 ou plus récent**, Git, VS Code, un compte GitHub.
- Notions de TypeScript / JavaScript et de HTTP (GET, POST, DELETE, codes de statut).
- **Aucune connaissance de NestJS n'est demandée.**

➡️ Suivez **[docs/00-installation.md](docs/00-installation.md)** *avant* la séance : l'installation prend 10 à 15 minutes.

## Déroulé

| Étape | Fonctionnalité | Notion NestJS | Durée |
|---|---|---|---|
| [0](docs/00-installation.md) | Installation, découverte du projet, Swagger | Structure d'un projet Nest | 10 min |
| [1](docs/etape-1.md) | `GET` lister les dépenses d'un porte-monnaie + total | Module, Controller, Service, injection de dépendances | 20 min |
| [2](docs/etape-2.md) | `POST` déclarer une dépense (montant > 0, dépenseur optionnel) | DTO, `class-validator`, `ValidationPipe` | 20 min |
| [3](docs/etape-3.md) | `DELETE` : seul le dépenseur (ou le créateur) peut supprimer | Guard, décorateur `@CurrentUser()`, `ForbiddenException` | 20 min |
| [4](docs/etape-4.md) | Clôturer le porte-monnaie : qui doit payer / recevoir combien | Service métier + tests | 25 min |
| [Bonus](docs/bonus.md) | Minimiser les virements, pagination, Interceptor de temps | « Think HUGE » | — |

Chaque fiche contient : l'objectif, la notion NestJS (avec un exemple de code qui n'est **pas** la solution), la liste de ce qu'il faut faire, des indices repliables, un **checkpoint** (test + requête de vérification) et la marche à suivre si vous êtes bloqué.

## Comment travailler

1. Créez votre dépôt depuis ce modèle (« Use this template »), clonez-le, installez (`npm install`).
2. Cherchez les `// TODO étape X` dans `src/` : ils indiquent **quel fichier** et **quelle fonction** compléter.
3. Vérifiez votre travail avec le test de l'étape :

   ```bash
   npm run test:etape1   # puis test:etape2, test:etape3, test:etape4
   ```

   Les tests s'exécutent **hors ligne** avec une fausse base de données en mémoire : ils ne touchent jamais la base Neon partagée. Au départ ils sont **tous rouges** — c'est normal, c'est votre travail de les faire passer. Leurs messages vous disent ce qui était attendu et ce qui a été reçu.
4. Testez aussi « pour de vrai » avec Swagger : <http://localhost:3000/api/docs> (voir la fiche d'installation).

### Les TODO

Dans VS Code, ouvrez la recherche globale (`Ctrl+Maj+F`) et cherchez `TODO étape 1` : vous voyez tous les endroits à compléter pour l'étape 1.

## Rattrapage

Si vous êtes en retard ou bloqué : le dépôt **solutions** contient une branche par étape : `etape-0`, `etape-1`, `etape-2`, `etape-3`, `etape-4` et `bonus`. La branche `etape-N` contient le code **terminé jusqu'à la fin de l'étape N**.

Pour récupérer le code corrigé de l'étape 2, par exemple :

```bash
npm run rattrapage -- 2
```

Le script sauvegarde d'abord votre dossier `src/` dans `.rattrapage-backup/`, puis le remplace par celui de la branche `etape-2`. Votre fichier `.env` n'est pas modifié. L'adresse du dépôt solutions vous est donnée en séance ; si le script la demande :

```bash
# macOS / Linux / Git Bash
SOLUTIONS_URL=https://github.com/LaCoir/tp-nestjs-solutions npm run rattrapage -- 2

# PowerShell
$env:SOLUTIONS_URL="https://github.com/LaCoir/tp-nestjs-solutions"; npm run rattrapage -- 2
```

<details>
<summary>Commandes Git équivalentes (sans le script)</summary>

```bash
git remote add solutions https://github.com/LaCoir/tp-nestjs-solutions
git fetch solutions etape-2
git checkout solutions/etape-2 -- src
```

</details>

> Le rattrapage de l'étape N **remplace tout `src/`** : après, vous repartez de l'étape N + 1.

## Structure du projet

```
src/
├── main.ts                    point d'entrée (Swagger, ValidationPipe)
├── app.module.ts              module racine : assemble tous les modules
├── auth/                      connexion, jetons JWT, JwtAuthGuard        (fourni)
│   └── decorators/            @CurrentUser()                              ← étape 3
├── users/  wallets/  invitations/  memberships/  notifications/          (fournis)
├── expenses/                  ← étapes 1 à 3 : les dépenses
│   ├── expenses.module.ts
│   ├── expenses.controller.ts
│   ├── expenses.service.ts
│   ├── expenses.helpers.ts    fonctions fournies (select, accès, état du porte-monnaie)
│   ├── dto/create-expense.dto.ts
│   └── guards/expense-owner.guard.ts
├── closure/                   ← étape 4 : clôture et bilan
│   ├── balance-calculator.ts  calcul des parts et des soldes
│   ├── balance-data.ts        lecture en base (fournie)
│   └── closure.service.ts
├── common/                    utilitaires (Swagger, interceptor du bonus)
└── prisma/                    accès à la base de données
prisma/schema.prisma           schéma de la base (partagé — lecture seule)
test/                          un fichier de test par étape
docs/                          les fiches du TP
```

## Règles du métier

- Les montants sont des **entiers en centimes** (`4599` = 45,99 €). Jamais de nombres à virgule.
- Seuls les **membres** (invitation acceptée) voient et modifient les dépenses d'un porte-monnaie.
- Une dépense a un **dépenseur** (`paidById`, celui qui a payé) et un **créateur** (`createdById`, celui qui l'a saisie). Par défaut, c'est la même personne.
- Seuls le dépenseur **ou** le créateur peuvent supprimer une dépense.
- Un porte-monnaie **clôturé** n'accepte plus aucune dépense.
- Chaque action sur un porte-monnaie met à jour sa date `updatedAt`.

## ⚠️ Base de données partagée

Toute la classe utilise **la même base Neon**. Pour ne gêner personne :

- Créez vos propres comptes de test (par exemple `prenom.nom+test1@exemple.fr`) et n'utilisez que *vos* porte-monnaies.
- Ne touchez pas aux données des autres.
- Le schéma de la base est **verrouillé** : il n'y a ni migration ni `prisma db push` dans ce projet, et vous n'en avez pas besoin.
- Ne partagez jamais le fichier `.env` et ne le commitez pas (il est ignoré par Git).

## Stack

NestJS 12 · TypeScript · Prisma (PostgreSQL / Neon) · Swagger (`@nestjs/swagger`) · Vitest + Supertest.

## Intégration continue

Le workflow `.github/workflows/test.yml` compile le projet et lance les tests à chaque `push`. Sur le dépôt de départ, les tests des étapes échouent volontairement : l'étape correspondante est marquée « échec ignoré » dans GitHub Actions.

---

*Note : ce sujet de TP et ses tests ont été rédigés avec l'aide d'une intelligence artificielle générative (Claude, Anthropic), conformément aux exigences de l'UE.*
