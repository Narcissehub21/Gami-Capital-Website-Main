# Site Gami Capital

Site multi-pages de Gami Capital, construit avec [Astro](https://astro.build) et prévu pour Vercel. Le design est celui de la maquette one-pager d'origine, découpé en pages indexables.

## Pages

| URL | Contenu |
| --- | --- |
| `/` | Accueil : hero, trois métiers, tableau Capital / Labs, derniers articles, contact |
| `/approach` | Thèse, trois métiers, 4 secteurs cibles, cas d'usage, stades, structuring |
| `/ecosystem` | Gami Capital et Gami Labs, la boucle interactive, les protocoles et l'infra utilisés par Labs |
| `/portfolio` | Toutes les sociétés (tuiles filtrables + tableau) |
| `/portfolio/[société]` | Une page par participation : résumé, stade, année, site, articles liés |
| `/insights` et `/insights/[article]` | Articles, avec auteur, sociétés citées, partage LinkedIn / X |
| `/team` et `/team/[personne]` | Équipe, une page profil par personne |
| `/contact` | Formulaire (fondateur, investisseur, partenaire, presse) + coordonnées |
| `/legal`, `/privacy` | Mentions légales et politique de confidentialité |

Générés automatiquement à chaque build : `sitemap-index.xml`, `robots.txt`, `rss.xml`, `llms.txt` (résumé du site pour les moteurs IA) et une image de partage (Open Graph) par page dans `/og/`.

## Travailler en local

Il faut Node 22.12 ou plus récent.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # génère le site dans dist/
npm run check      # vérifie les types et le contenu
```

Le formulaire de contact et le numéro de bloc Ethereum de l'accueil passent par des fonctions Vercel (dossier `api/`). Avec `npm run dev`, ils ne répondent pas : le formulaire propose alors un lien mailto et le bloc reste masqué. Pour les tester en local, utiliser `npx vercel dev`.

## Modifier le contenu

Tout le contenu éditorial est en Markdown dans `src/content/`. Chaque fichier commence par un bloc de champs (entre les `---`), suivi du texte. Les fichiers qui commencent par `_` sont des modèles et ne sont jamais publiés.

### Publier un article

1. Copier `src/content/insights/_template.md` et le renommer, par exemple `fixed-rate-credit-onchain.md`. Le nom du fichier devient l'URL : `/insights/fixed-rate-credit-onchain`.
2. Remplir les champs :
   - `title` : 50 à 65 caractères, c'est le titre affiché dans Google.
   - `description` : 140 à 160 caractères, affichée dans Google et dans les aperçus LinkedIn.
   - `date` au format `2026-10-08`, et `updated` si l'article est mis à jour plus tard.
   - `author` : le nom du fichier d'un membre de l'équipe, sans `.md` (ex. `valentin-verger`).
   - `tags` : 1 à 3 thèmes.
   - `companies` : les sociétés du portfolio dont parle l'article (nom de fichier sans `.md`). L'article apparaît alors sur leur page.
   - `draft: true` tant que l'article n'est pas prêt. Il est visible en local mais pas en ligne.
3. Écrire en Markdown. Intertitres avec `##` (jamais `#`, le titre de la page existe déjà). Liens internes du type `[Iris](/portfolio/iris)`.

L'image de partage de l'article est générée toute seule à partir du titre.

### Ajouter un membre de l'équipe

Copier `src/content/team/_template.md`, renommer en `prenom-nom.md`, remplir. Pour une photo, déposer un fichier carré d'au moins 800×800 px dans `public/images/team/` et indiquer son chemin dans `photo`. Sans photo, des initiales s'affichent.

### Ajouter ou modifier une société du portfolio

Un fichier par société dans `src/content/portfolio/`. Champs :

- `name`, `sector` (ex. « Vault infrastructure »), `summary` (une phrase)
- `category` : `infra`, `defi`, `credit` ou `ai`
- `stage` : `Pre-seed`, `Seed` ou `Strategic`
- `year` : année de l'investissement
- `website`, `logo` (image 128×128 dans `public/images/portfolio/`)
- `accent` et `tint` : les deux couleurs de la marque, utilisées pour l'effet au survol et l'image de partage
- `labsInfra: true` si Gami Labs utilise aussi la société comme infrastructure

Le texte sous le bloc de champs s'affiche sur la page de la société. C'est le meilleur endroit pour ajouter la thèse d'investissement, la date du tour, les co-investisseurs publics : plus la page est riche, mieux elle se positionne sur « [société] investors ».

Les compteurs (nombre de sociétés, répartition par secteur, années) se mettent à jour seuls.

### Réglages généraux

`src/site.config.mjs` contient l'URL du site, l'email, l'adresse, les liens LinkedIn et X, le menu et les infos des mentions légales. Les textes juridiques sont dans `src/content/legal/`.

Pour changer le logo ou la couleur des icônes : modifier `scripts/make-icons.mjs` puis lancer `npm run icons`.

## Mise en ligne sur Vercel

1. Mettre le dossier sur GitHub (dépôt privé).
2. Sur Vercel : Add New > Project > importer le dépôt. Vercel détecte Astro, il n'y a rien à régler.
3. Dans Settings > Environment Variables, ajouter :
   - `RESEND_API_KEY` : clé API [Resend](https://resend.com), le service qui envoie les messages du formulaire.
   - `CONTACT_TO` : adresse qui reçoit les messages (par défaut `contact@gami.ventures`).
   - `CONTACT_FROM` : expéditeur, sur un domaine vérifié dans Resend, ex. `Gami Capital website <website@gami.ventures>`.
4. Dans Settings > Domains, brancher le domaine.

Chaque `git push` met le site à jour. Chaque branche a son URL de prévisualisation.

`vercel.json` gère les URL sans `.html`, quelques redirections et les en-têtes de sécurité et de cache.

## Avant la mise en ligne

- [ ] Confirmer le domaine dans `src/site.config.mjs` (`SITE_URL`). Il sert aux URL canoniques, au sitemap et aux images de partage.
- [ ] Renseigner dans `src/site.config.mjs` le numéro IDE (CHE-…) et, si besoin, la TVA et le responsable de publication. Les lignes vides n'apparaissent pas sur `/legal`.
- [ ] Faire relire `/legal`, `/privacy` et `/approach` par le juriste ou le compliance officer. Le site parle de véhicules et d'accès pour investisseurs qualifiés, ce qui peut relever de la publicité financière au sens de la LSFin.
- [ ] Vérifier la bio et le résumé de `src/content/team/valentin-verger.md`. Remplacer les photos de `public/images/team/` par des fichiers carrés d’au moins 800×800 px (celles en place sont des captures basse résolution).
- [ ] Relire l'article d'exemple `src/content/insights/gami-capital-and-gami-labs.md` (le garder, le modifier ou passer `draft: true`).
- [ ] Vérifier le domaine d'envoi dans Resend (enregistrements SPF et DKIM), puis envoyer un message test depuis `/contact`.
- [ ] Ajouter le site à Google Search Console et Bing Webmaster Tools et y soumettre `https://<domaine>/sitemap-index.xml`.
- [ ] Tester un lien dans le [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) pour vérifier l'aperçu.
- [ ] Si l'ancien site avait d'autres URL, ajouter les redirections dans `vercel.json`.

## Vie privée

Le site ne pose aucun cookie et n'a pas d'outil d'analyse. Les polices sont servies depuis le domaine du site. Le numéro de bloc Ethereum est récupéré par la fonction `api/block.js`, côté serveur, et mis en cache 10 secondes : le navigateur du visiteur ne contacte aucun tiers. Si un outil d'analyse est ajouté plus tard (Vercel Web Analytics par exemple), il faudra mettre à jour `/privacy`.

## Structure

```
api/                  fonctions Vercel (formulaire, bloc Ethereum)
public/               images, logos, icônes
scripts/              génération des icônes
src/content/          contenu en Markdown (portfolio, équipe, articles, légal)
src/components/       blocs réutilisables (nav, tuiles portfolio, boucle écosystème…)
src/layouts/Base.astro  balises SEO, Open Graph, données structurées
src/pages/            une page = un fichier ; og/ = images de partage
src/styles/           global.css (design d'origine), pages.css (ajouts multi-pages)
src/site.config.mjs   réglages du site
```
