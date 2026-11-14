# Étape 0 — Installation et découverte (à faire AVANT la séance)

⏱️ 15 minutes environ. Si un point bloque, notez l'erreur et venez nous voir en début de séance.

## 1. Logiciels à installer

| Outil | Version | Vérification |
|---|---|---|
| **Node.js** (LTS) | **22 ou plus récent** — obligatoire | `node -v` doit afficher `v22.x.x` ou plus |
| **npm** | fourni avec Node | `npm -v` |
| **Git** | récent | `git --version` |
| **VS Code** | récent | — |
| Compte **GitHub** | — | — |

> ⚠️ **Node 22 minimum.** Avec une version plus ancienne (18, 20…), l'installation ou le démarrage échouera. Téléchargez la version « LTS » sur <https://nodejs.org>.

### Extensions VS Code conseillées

- **Prisma** (`Prisma.prisma`) : coloration du schéma de la base.
- **Prettier** (`esbenp.prettier-vscode`) : mise en forme du code.
- **Vitest** (`vitest.explorer`) : lancer les tests depuis VS Code (facultatif).
- **REST Client** ou **Thunder Client** : envoyer des requêtes HTTP (facultatif, Swagger suffit).

## 2. Créer votre dépôt à partir du modèle

1. Ouvrez l'adresse du dépôt modèle donnée par l'enseignant (`https://github.com/LaCoir/tp-nestjs-bons-comptes`).
2. Cliquez sur le bouton vert **« Use this template »** → **« Create a new repository »**.
3. Choisissez votre compte comme propriétaire, un nom (par ex. `tp-nestjs-bons-comptes`), visibilité **Private** de préférence, puis **Create repository**.

   > Ne cochez pas « Include all branches » : seule la branche principale est utile.
4. Clonez **votre** dépôt :

   ```bash
   git clone https://github.com/<votre-compte>/tp-nestjs-bons-comptes.git
   cd tp-nestjs-bons-comptes
   code .
   ```

## 3. Installer les dépendances

```bash
npm install
```

Cette commande télécharge les bibliothèques **et** génère le client Prisma (script `postinstall`). Comptez 1 à 2 minutes.

## 4. Configurer l'environnement

```bash
# macOS / Linux / Git Bash
cp .env.example .env

# PowerShell
Copy-Item .env.example .env
```

Ouvrez `.env` et complétez :

1. **`DATABASE_URL`** : collez l'URL de la base Neon communiquée par l'enseignant le jour de la séance. Elle ressemble à :
   `postgresql://…@…-pooler.….neon.tech/…?sslmode=require&pgbouncer=true&connection_limit=3&connect_timeout=15`
   - le nom d'hôte contient **`-pooler`** ;
   - elle se termine par `pgbouncer=true&connection_limit=3` : ne retirez pas ces paramètres, ils évitent de saturer la base partagée.
2. **`JWT_SECRET`** et **`JWT_REFRESH_SECRET`** : deux chaînes aléatoires **différentes**, propres à votre poste. Générez-les avec :

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   (lancez la commande deux fois, une par secret).

> 🔒 Le fichier `.env` contient des secrets : il est ignoré par Git. **Ne le commitez jamais** et ne le partagez pas.

## 5. Vérifier que tout démarre

```bash
npm run build          # doit se terminer sans erreur
npm run start:dev      # démarre le serveur en mode « watch »
```

Vous devez voir `Nest application successfully started`. Ouvrez ensuite **Swagger** : <http://localhost:3000/api/docs>.

Arrêtez le serveur avec `Ctrl+C`. Lancez enfin les tests :

```bash
npm run test:etapes
```

Les tests des étapes 1 à 4 sont **rouges** : c'est normal, ils passeront au fil du TP. Pour vérifier que le reste de l'application est sain : `npx vitest run src` doit être entièrement vert.

## 6. Découvrir le projet avec Swagger (étape 0 — 10 min en séance)

Swagger est la documentation interactive de l'API. Il permet d'envoyer des requêtes sans écrire de code.

1. **Créer un compte** : `POST /users` → *Try it out* avec
   ```json
   { "email": "prenom.nom+test1@exemple.fr", "name": "Prénom Nom", "password": "motdepasse123" }
   ```
2. **Se connecter** : `POST /auth/login` avec l'e-mail et le mot de passe. Copiez la valeur de `accessToken` dans la réponse.
3. **S'authentifier dans Swagger** : cliquez sur le bouton **Authorize** 🔒 en haut à droite, collez le jeton (sans le mot « Bearer »), puis *Authorize*. Toutes les routes protégées utiliseront maintenant ce jeton.
4. **Créer un porte-monnaie** : `POST /wallets` avec `{ "title": "Week-end test" }`. Notez son `id`.
5. Explorez `GET /wallets`, `GET /wallets/{id}`. La section **expenses** est vide : elle sera remplie par *vous*.

Pour tester les dépenses à plusieurs, créez un second compte, invitez-le (`POST /wallets/{walletId}/invitations` avec son e-mail), puis connectez-vous avec lui et acceptez l'invitation (`GET /invitations`, `POST /invitations/{id}/accept`).

### Visite guidée du code (5 minutes)

Ouvrez dans l'ordre :

1. `src/main.ts` : démarrage, `ValidationPipe`, Swagger.
2. `src/app.module.ts` : le module racine importe tous les modules.
3. `src/wallets/wallets.module.ts`, `wallets.controller.ts`, `wallets.service.ts` : un module **complet** que vous prendrez pour modèle.
4. `src/expenses/` : le module que vous allez compléter (presque vide).

## FAQ — erreurs fréquentes

<details>
<summary><strong>« node » n'est pas reconnu comme commande (Windows)</strong></summary>

Node n'est pas dans le `PATH`. Réinstallez Node en laissant cochée l'option « Add to PATH », puis **fermez et rouvrez** VS Code et le terminal. Vérifiez avec `node -v`.

</details>

<details>
<summary><strong><code>npm : l'exécution de scripts est désactivée sur ce système</code> (PowerShell)</strong></summary>

Dans PowerShell, exécutez une fois : `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, ou utilisez l'invite de commandes (cmd) / Git Bash.

</details>

<details>
<summary><strong>Version de Node trop ancienne (<code>Unsupported engine</code>, <code>SyntaxError</code>…)</strong></summary>

Le projet exige **Node 22 ou plus**. Vérifiez `node -v`. Mettez à jour depuis <https://nodejs.org> (LTS) ou avec `nvm install 22 && nvm use 22`. Après le changement : supprimez `node_modules` et relancez `npm install`.

</details>

<details>
<summary><strong>Port 3000 déjà occupé (<code>EADDRINUSE</code>)</strong></summary>

Une autre application utilise ce port. Soit vous l'arrêtez, soit vous changez le port dans `.env` : `PORT=3005` (Swagger sera alors sur `http://localhost:3005/api/docs`).

- Windows : `netstat -ano | findstr :3000` puis `taskkill /PID <numéro> /F`
- macOS / Linux : `lsof -i :3000` puis `kill <numéro>`

</details>

<details>
<summary><strong><code>EPERM</code> / <code>operation not permitted</code> pendant <code>npm install</code> ou <code>prisma generate</code> (Windows)</strong></summary>

Un serveur ou un test encore lancé verrouille un fichier de Prisma. Arrêtez tous les terminaux qui exécutent `npm run start:dev` ou `vitest`, puis relancez `npm install`. Si le problème persiste, fermez VS Code.

</details>

<details>
<summary><strong><code>Cannot find module './xxx.service'</code> ou <code>ERR_MODULE_NOT_FOUND</code> — les imports locaux doivent se terminer par <code>.js</code></strong></summary>

Ce projet utilise les **modules ES (ESM)**. Dans ce mode, **tous les imports de fichiers locaux doivent se terminer par `.js`**, même si le fichier source est en `.ts` :

```ts
import { ExpensesService } from './expenses.service.js';   // ✅
import { ExpensesService } from './expenses.service';      // ❌ erreur au démarrage
```

L'import d'une bibliothèque (`@nestjs/common`, `class-validator`…) ne prend **pas** de `.js`. L'auto-import de VS Code oublie parfois le `.js` : ajoutez-le à la main.

</details>

<details>
<summary><strong><code>Environment variable not found: DATABASE_URL</code> ou <code>JWT_SECRET</code> manquant</strong></summary>

Le fichier `.env` n'existe pas, est vide, ou n'est pas à la racine du projet (à côté de `package.json`). Refaites l'étape 4. Redémarrez le serveur après toute modification.

</details>

<details>
<summary><strong><code>Can't reach database server</code>, <code>P1001</code>, délai dépassé</strong></summary>

- La base Neon se met en veille : relancez, le premier appel peut prendre quelques secondes.
- Vérifiez que l'URL est exactement celle donnée par l'enseignant (sans espace, entre guillemets).
- Vérifiez votre connexion réseau (certains réseaux bloquent le port PostgreSQL 5432 : essayez un partage de connexion).

</details>

<details>
<summary><strong><code>Too many connections</code> / <code>P2037</code></strong></summary>

La base est partagée par toute la classe. Conservez `connection_limit=3` dans l'URL et n'ouvrez qu'**un seul** serveur (`start:dev`) à la fois.

</details>

<details>
<summary><strong>Les tests sont tous rouges au démarrage</strong></summary>

C'est attendu : ils vérifient le code que vous allez écrire. Lisez le message d'échec : il indique la valeur attendue et la valeur reçue.

</details>

<details>
<summary><strong>Swagger affiche 401 « Unauthorized »</strong></summary>

Le jeton a expiré (durée de vie courte) ou n'a pas été saisi : reconnectez-vous avec `POST /auth/login`, puis cliquez sur **Authorize** et collez le nouveau `accessToken`.

</details>
