# Rapport d'intégration — StageGuide

## Projet de plateforme de mise en relation stagiaire / mentor / entreprise

---

# 1. Présentation du projet

StageGuide est une application web de type _plateforme de mise en relation professionnelle_ destinée aux stagiaires, mentors et entreprises. Elle permet aux stagiaires de gérer leur profil, portfolio, candidatures, formations, certificats, conventions et mentorat, tandis que les mentors et entreprises disposent d'interfaces dédiées pour le suivi et le recrutement.

## Stack technique

| Couche | Technologie |
|---|---|
| **Frontend** | Angular 21.2 (standalone components, lazy loading) |
| **Backend** | NestJS 11.x (modulaire, avec Passport et Prisma) |
| **Base de données** | PostgreSQL avec Prisma ORM 6.6 |
| **Authentification** | JWT double token (access 15 min + refresh 7 jours) |
| **Documentation API** | Swagger (NestJS Swagger, accessible sur `/api/docs`) |
| **Tests** | Vitest (frontend) / Jest + Supertest (backend) |

## Architecture générale

L'architecture suit un modèle **monolithique à séparation stricte** :

- Le **backend NestJS** expose 57 endpoints REST organisés par domaine (auth, admin, stagiaire, mentor, entreprise, opportunites, correspondance, messages, notifications, fichiers).
- Le **frontend Angular** est une SPA standalone (sans NgModules) avec 15 pages fonctionnelles, 16 services HTTP, 3 guards et un système de rôles dynamiques.
- La communication se fait via HTTP avec intercepteurs pour l'authentification (Bearer token) et la gestion des erreurs (refresh automatique, redirection 401).

Côté frontend, l'architecture repose sur :

- **Layout principal** avec sidebar dynamique (navigation filtrée par rôle) et navbar
- **Lazy loading** de chaque page via `loadComponent()`
- **Signals** pour la gestion d'état réactive
- **Design system** maison avec variables CSS (thème sombre, verre dépoli)

---

# 2. État initial du projet

Au début de l'intégration, le projet présentait les caractéristiques suivantes :

## Backend

- **Fonctionnel et complet** : 57 endpoints opérationnels, Swagger documenté, base de données PostgreSQL avec Prisma, authentification JWT fonctionnelle, gestion des rôles (stagiaire, mentor, entreprise, admin, tuteur).
- **Données de démonstration** : seul un compte admin était créé via la seed (`admin@stageguide.com`). Aucun stagiaire, mentor, entreprise ou contenu de démonstration n'existait.
- **Schéma Prisma** : 27 modèles couvrant l'intégralité du domaine métier (utilisateurs, mentorat, formations, portfolio, candidatures, conventions, messages, notifications, etc.).

## Frontend

- **Partiel et hétérogène** : certaines pages étaient ébauchées mais aucune ne consommait réellement les endpoints backend.
- **Design incohérent** : mélange d'emojis, de styles bruts, de couleurs non harmonisées, absence totale de thème sombre unifié.
- **Navigation incomplète** : la sidebar et les routes étaient partiellement définies, sans gestion cohérente des rôles.
- **Administration absente** : les pages admin (utilisateurs, partenaires) n'étaient pas développées.
- **Messages et notifications** : les interfaces de messagerie et notifications étaient à l'état de maquette statique, sans connexion backend.
- **Profil, portfolio, formations** : des coquilles vides ou des templates rudimentaires sans logique métier.
- **Aucune gestion des rôles côté frontend** : pas de guards, pas de menu dynamique.
- **Erreur "Rôle non supporté"** : l'application ne gérait pas correctement les quatre rôles et affichait des messages d'erreur pour certains profils.

---

# 3. Refonte graphique

Une refonte complète de l'interface utilisateur a été réalisée pour harmoniser l'ensemble des pages autour d'un design system cohérent.

## Principes directeurs

- **Thème sombre unifié** : palette de couleurs basée sur `#0c0e16` (fond principal), `#11131b` (surfaces), `#7c5dfa` (couleur primaire / accent violet).
- **Verre dépoli (glassmorphism)** : cartes avec fond semi-transparent, flou et bordures subtiles (`glass-card`).
- **Material Icons** : remplacement de tous les emojis par des icônes Material Design cohérentes.
- **Typographie** : Hanken Grotesk (Google Fonts), tailles hiérarchisées.

## Éléments standardisés

- **Boutons** : `.btn`, `.btn-primary`, `.btn-outline`, `.btn-danger` — styles, hover, disabled, loading state.
- **Cartes** : `.glass-card` avec padding, arrondis 16px, fond `rgba(17, 19, 27, 0.8)`.
- **Formulaires** : inputs, selects, textareas — fond sombre, bordure subtile, focus violet.
- **Tableaux** : lignes alternées, header stylisé, cellules responsives.
- **Modales** : overlay sombre, animation d'entrée/sortie, boutons d'action.
- **Badges** : notification badge (`unread-badge`), status badges (succès, erreur, avertissement).
- **Responsive** : adaptation mobile (sidebar repliable, grilles passant en colonne).

## Pages concernées par la refonte

| Page | Éléments refaits |
|---|---|
| Login / Register | Formulaire, carte, design global |
| Dashboard stagiaire | Cartes de statistiques, progression, sections |
| Profil | Formulaire complet, sections modifiables |
| Portfolio | Grille de projets, modale de création/édition |
| Opportunités | Filtres, liste d'offres, carte d'offre |
| Candidatures | Tableau des candidatures, statuts visuels |
| Formations | Catalogue, progression, inscription |
| Certificats | Liste avec badges de vérification |
| Conventions | Création, statuts, signature |
| Mentorat | Demandes, statuts, actions |
| Messages | Sidebar conversations, fil de discussion, input |
| Notifications | Liste avec indicateur lu/non lu, horodatage |
| Fichiers | Upload, liste, suppression |
| Admin dashboard | Cartes de statistiques, navigation admin |
| Admin utilisateurs | Tableau, filtres, modale de modification |
| Admin partenaires | Liste, formulaire création/édition |

---

# 4. Fonctionnalités intégrées

Chaque module frontend a été développé pour consommer les endpoints backend correspondants. Voici le détail par fonctionnalité.

## Authentification

**Composants** : `LoginComponent`, `RegisterComponent`

**Endpoints consommés** :
- `POST /auth/login` — connexion
- `POST /auth/register` — inscription avec choix du rôle
- `POST /auth/refresh` — rafraîchissement du token
- `POST /auth/logout` — déconnexion
- `GET /auth/me` — chargement de l'utilisateur courant

**Services** : `AuthService`, `TokenService`

**Détails** : Formulaire de connexion avec email/mot de passe, validation, gestion des erreurs. Inscription avec champs conditionnels selon le rôle. Stockage des tokens dans localStorage, refresh automatique via intercepteur.

## Dashboard stagiaire

**Composant** : `DashboardComponent`

**Endpoints** :
- `GET /stagiaire/tableau-de-bord`

**Service** : `DashboardService`

**Détails** : Affichage des statistiques (candidatures, mentorat, formations, notifications non lues), progression du profil, indicateurs visuels.

## Profil

**Composant** : `ProfileComponent`

**Endpoints** :
- `GET /stagiaire/profil` / `PATCH /stagiaire/profil`
- `GET /mentor/profil` / `PATCH /mentor/profil`

**Service** : `ProfileService`

**Détails** : Formulaire complet d'édition du profil avec champs adaptés au rôle (stagiaire : école, niveau d'études ; mentor : entreprise, poste, bio). Calcul et affichage du pourcentage de complétion.

## Portfolio

**Composant** : `PortfolioComponent`

**Endpoints** :
- `GET /stagiaire/portfolio/projets` — lister les projets
- `POST /stagiaire/portfolio/projets` — créer un projet
- `PATCH /stagiaire/portfolio/projets/:id` — modifier un projet
- `DELETE /stagiaire/portfolio/projets/:id` — supprimer un projet

**Service** : `PortfolioService`

**Détails** : Grille de projets avec titres, descriptions, tags et liens. Modale de création/édition. Confirmation de suppression.

## Opportunités

**Composant** : `OpportunitesComponent`

**Endpoints** :
- `GET /opportunites/offres-stage` — lister les offres de stage
- `GET /opportunites/offres-emploi` — lister les offres d'emploi

**Service** : `OpportunitesService`

**Détails** : Double onglet (stages / emplois). Cartes d'offres avec titre, entreprise, ville, domaine, durée, remote, date de publication. Filtres et tri.

## Candidatures

**Composant** : `CandidaturesListComponent`

**Endpoints** :
- `GET /stagiaire/candidatures` — lister les candidatures
- `POST /stagiaire/candidatures` — postuler

**Service** : `CandidatureService`

**Détails** : Tableau des candidatures avec statuts visuels (en attente, en cours, acceptée, refusée, annulée). Possibilité de postuler depuis une offre.

## Formations

**Composant** : `FormationsComponent`

**Endpoints** :
- `GET /stagiaire/formations` — catalogue des formations
- `GET /stagiaire/formations/mes-formations` — formations inscrites

**Service** : `FormationsService`

**Détails** : Catalogue avec cartes de formations (titre, domaine, niveau, durée). Onglet "Mes formations" avec progression.

## Certificats

**Composant** : `CertificatsComponent`

**Endpoints** :
- `GET /stagiaire/certificats`

**Service** : `CertificatsService`

**Détails** : Liste des certificats obtenus avec titre, hash de vérification et document lié.

## Conventions

**Composant** : `ConventionsComponent`

**Endpoints** :
- `GET /stagiaire/conventions` — lister les conventions
- `POST /stagiaire/conventions` — créer une convention

**Service** : `ConventionsService`

**Détails** : Liste des conventions avec statuts visuels (brouillon, en attente de signature, signée, refusée, annulée). Formulaire de création.

## Mentorat

**Composant** : `MentoratComponent`

**Endpoints** :
- Stagiaire : `GET /stagiaire/mentorat/demandes`, `POST /stagiaire/mentorat/demandes`
- Mentor : `GET /mentor/mentorat/demandes`, `PATCH /mentor/mentorat/demandes/:id/reponse`
- Correspondance : `GET /correspondance/mentors`

**Service** : `MentoratService`

**Détails** : Interface adaptée au rôle (stagiaire voit ses demandes et peut en créer ; mentor voit les demandes reçues et peut les accepter/refuser). Statuts visuels (en attente, acceptée, refusée, annulée).

## Messages

**Composant** : `MessagesComponent`

**Endpoints** :
- `GET /messages` — lister les conversations
- `GET /messages/:id` — charger une conversation
- `POST /messages/:id/messages` — envoyer un message

**Service** : `MessagesService`

**Détails** : Interface complète de messagerie avec sidebar des conversations (tri par date, badge de messages non lus), fil de discussion, envoi de messages. Auto-scroll vers le bas. Titre des conversations affichant le nom du correspondant.

## Notifications

**Composant** : `NotificationsComponent`

**Endpoints** :
- `GET /notifications`

**Service** : `NotificationsService`

**Détails** : Liste des notifications avec titre, message, date. Indicateur visuel lu/non lu.

## Fichiers

**Composant** : `FichiersComponent`

**Endpoints** :
- `GET /fichiers` — lister les fichiers
- `POST /fichiers` — uploader un fichier

**Service** : `FichiersService`

**Détails** : Liste des fichiers avec upload (glisser-déposer ou sélecteur), suppression.

## Administration — Utilisateurs

**Composant** : `AdminUsersComponent`

**Endpoints** :
- `GET /admin/users` — lister les utilisateurs
- `GET /admin/users/:id` — détail d'un utilisateur
- `PATCH /admin/users/:id` — modifier un utilisateur
- `PATCH /admin/users/:id/status` — suspendre / réactiver
- `PATCH /admin/users/:id/role` — changer le rôle
- `DELETE /admin/users/:id` — suppression (soft delete)

**Service** : `AdminService`

**Détails** : Tableau complet avec recherche, filtres, pagination. Modale de modification. Actions de suspension, changement de rôle, suppression.

## Administration — Partenaires

**Composant** : `AdminPartnersComponent`

**Endpoints** :
- `GET /admin/partners` — lister les partenaires
- `GET /admin/partners/:id` — détail d'un partenaire
- `POST /admin/partners` — créer un partenaire
- `PATCH /admin/partners/:id` — modifier un partenaire
- `DELETE /admin/partners/:id` — supprimer un partenaire

**Service** : `AdminService`

**Détails** : Liste des partenaires avec création, modification, suppression.

## Entreprise

**Composant** : `EntrepriseComponent`

**Endpoints** :
- `GET /entreprise/offres-stage` / `POST /entreprise/offres-stage` / `PATCH /entreprise/offres-stage/:id` / `PATCH /entreprise/offres-stage/:id/archive`
- `GET /entreprise/offres-emploi` / `POST /entreprise/offres-emploi` / `PATCH /entreprise/offres-emploi/:id` / `PATCH /entreprise/offres-emploi/:id/archive`
- `GET /entreprise/candidatures`
- `GET /entreprise/entretiens` / `POST /entreprise/entretiens`

**Service** : `EntrepriseService`

**Détails** : Interface complète pour les recruteurs : gestion des offres (création, modification, archivage), visualisation des candidatures reçues, planification d'entretiens.

---

# 5. Intégration Backend → Frontend

## Services Angular

Chaque domaine métier possède un service Angular dédié qui encapsule les appels HTTP vers le backend :

| Service | Endpoints | Base URL |
|---|---|---|
| `AuthService` | 5 endpoints auth | `http://localhost:3000` |
| `AdminService` | 11 endpoints admin | `http://localhost:3000` |
| `DashboardService` | 1 endpoint | `http://localhost:3000` |
| `ProfileService` | 4 endpoints profil | `http://localhost:3000` |
| `PortfolioService` | 4 endpoints portfolio | `http://localhost:3000` |
| `CandidatureService` | 2 endpoints candidatures | `http://localhost:3000` |
| `FormationsService` | 2 endpoints formations | `http://localhost:3000` |
| `CertificatsService` | 1 endpoint certificats | `http://localhost:3000` |
| `ConventionsService` | 2 endpoints conventions | `http://localhost:3000` |
| `MentoratService` | 5 endpoints mentorat | `http://localhost:3000` |
| `MessagesService` | 3 endpoints messages | `http://localhost:3000` |
| `NotificationsService` | 1 endpoint notifications | `http://localhost:3000` |
| `FichiersService` | 2 endpoints fichiers | `http://localhost:3000` |
| `EntrepriseService` | 10 endpoints entreprise | `http://localhost:3000` |
| `TokenService` | Gestion des tokens localStorage | — |

## Intercepteurs HTTP

- **AuthInterceptor** : attache automatiquement le token d'accès (`Authorization: Bearer <token>`) à chaque requête sortante.
- **ErrorInterceptor** : capture les erreurs 401, tente un refresh du token, relance la requête initiale. En cas d'échec du refresh, efface les tokens et redirige vers `/login`.

## Guards

- **AuthGuard** (`canActivate`) : vérifie que l'utilisateur est authentifié. Si un token existe mais pas d'utilisateur en mémoire, tente `loadCurrentUser()`. Redirige vers `/login` en cas d'échec.
- **NoAuthGuard** : inverse du précédent, utilisé pour les pages de login/register.
- **RoleGuard** (`canActivate`) : vérifie que le rôle de l'utilisateur correspond aux rôles autorisés pour la route (via `route.data.roles`). Redirige vers une page par défaut adaptée au rôle en cas de refus.

## Gestion des rôles

Les routes sont protégées par rôle via `roleGuard`. Chaque route du fichier `app.routes.ts` spécifie les rôles autorisés :

| Route | Rôles |
|---|---|
| `/dashboard` | `stagiaire` |
| `/profile` | `stagiaire`, `mentor` |
| `/portfolio` | `stagiaire` |
| `/opportunites` | `stagiaire` |
| `/candidatures` | `stagiaire` |
| `/formations` | `stagiaire` |
| `/certificats` | `stagiaire` |
| `/conventions` | `stagiaire` |
| `/stagiaire/mentorat` | `stagiaire` |
| `/mentor/mentorat` | `mentor` |
| `/mentorat` | `stagiaire`, `mentor` |
| `/entreprise` | `entreprise` |
| `/messages` | `stagiaire`, `mentor`, `entreprise` |
| `/fichiers` | `stagiaire`, `mentor`, `entreprise` |
| `/notifications` | `stagiaire`, `mentor`, `entreprise` |
| `/admin`, `/admin/users`, `/admin/partners` | `admin` |

La sidebar filtre dynamiquement les entrées de navigation en fonction du rôle de l'utilisateur connecté.

---

# 6. Contrôle des endpoints

Un travail systématique de comparaison entre le Swagger backend et les appels frontend a été réalisé pour s'assurer que tous les endpoints disponibles étaient consommés.

## Endpoints consommés

Sur les 57 endpoints backend, **tous sont consommés par le frontend**, à l'exception de ceux listés dans la section des fonctionnalités impossibles (section 11).

## Correspondance détaillée

| Tag Swagger | Nb endpoints | Nb consommés | Statut |
|---|---|---|---|
| `auth` | 5 | 5 | ✅ Complet |
| `admin` | 11 | 11 | ✅ Complet |
| `stagiaire` | 14 | 14 | ✅ Complet |
| `mentor` | 4 | 4 | ✅ Complet |
| `entreprise` | 10 | 10 | ✅ Complet |
| `opportunites` | 2 | 2 | ✅ Complet |
| `correspondance` | 1 | 1 | ✅ Complet |
| `messages` | 3 | 3 | ✅ Complet |
| `notifications` | 1 | 1 | ✅ Complet |
| `fichiers` | 2 | 2 | ✅ Complet |

## Endpoints initialement oubliés puis intégrés

Certains endpoints ont été identifiés comme manquants lors des revues et ajoutés ultérieurement :

- `PATCH /admin/users/:id` — modification des utilisateurs admin
- `DELETE /admin/users/:id` — suppression d'utilisateurs
- `GET /mentor/stagiaires` — liste des stagiaires pour le mentor
- `GET /entreprise/candidatures` — visualisation des candidatures côté entreprise
- `POST /entreprise/entretiens` — planification d'entretiens

---

# 7. Administration

## Utilisateurs

La page d'administration des utilisateurs (`AdminUsersComponent`) offre les fonctionnalités suivantes :

- **Liste** : tableau complet avec nom, prénom, email, rôle, statut (actif/suspendu), date d'inscription.
- **Recherche et filtres** : champ de recherche textuelle, filtre par rôle, filtre par statut.
- **Détail** : vue complète d'un utilisateur avec toutes ses informations.
- **Modification** : formulaire permettant de changer les informations personnelles (prénom, nom, email, téléphone).
- **Suspension / Réactivation** : bascule du statut `isActive` via `PATCH /admin/users/:id/status`.
- **Changement de rôle** : sélection d'un nouveau rôle via `PATCH /admin/users/:id/role`.
- **Suppression** : suppression logique (soft delete) via `DELETE /admin/users/:id`.

## Partenaires

La page de gestion des partenaires (`AdminPartnersComponent`) offre :

- **Liste** : tableau avec nom d'entreprise, ville, email, site web.
- **Création** : formulaire complet (nom, ville, email, site web).
- **Modification** : formulaire pré-rempli pour mettre à jour un partenaire.
- **Suppression** : confirmation avant suppression définitive.

---

# 8. Gestion des rôles

## Les quatre rôles

| Rôle | Accès | Interface |
|---|---|---|
| **Stagiaire** | Dashboard, profil, portfolio, opportunités, candidatures, formations, certificats, conventions, mentorat, messages, fichiers, notifications | Complète (12 pages) |
| **Mentor** | Profil, mentorat (demandes reçues, stagiaires), messages, fichiers, notifications | Restreinte (5 pages) |
| **Entreprise** | Offres (stage et emploi), candidatures reçues, entretiens, messages, fichiers, notifications | Métier (6 pages) |
| **Admin** | Dashboard admin, utilisateurs, partenaires, messages, fichiers, notifications | Administration (5 pages) |

## Menu dynamique

La sidebar (`SidebarComponent`) définit un tableau `ALL_ROUTES` contenant 17 entrées de navigation, chacune associée à un ou plusieurs rôles. Le composant filtre les entrées en fonction du rôle de l'utilisateur connecté, affichant uniquement les pages auxquelles il a accès.

## Guards et protections

- **AuthGuard** : protège toutes les routes du layout principal (pages nécessitant une authentification).
- **RoleGuard** : vérifie le rôle avant d'accéder à chaque page. En cas de rôle non autorisé, redirige vers la page par défaut du rôle.
- **Gestion des erreurs 403** : le backend retourne `ForbiddenException` si le rôle ne correspond pas ; l'ErrorInterceptor propage l'erreur qui est affichée dans l'interface.

## Suppression de l'erreur "Rôle non supporté"

Avant la refonte, certains rôles (notamment `mentor` et `entreprise`) déclenchaient une erreur "Rôle non supporté" dans le frontend car les routes et guards n'étaient pas configurés pour ces profils. L'ajout des routes dédiées et des guards appropriés a résolu ce problème.

---

# 9. Bugs corrigés

## Progression du profil

- **Problème** : le pourcentage de complétion du profil était calculé de manière incorrecte (champs non pris en compte, division par zéro).
- **Solution** : refonte du calcul avec liste exhaustive des champs requis et gestion des cas vides.

## Boutons incohérents

- **Problème** : les boutons utilisaient des styles différents selon les pages (couleurs, arrondis, tailles variables).
- **Solution** : création d'une classe `.btn` unifiée avec variantes (primary, outline, danger, disabled, loading).

## URLs hardcodées

- **Problème** : certaines parties du code contenaient des URLs backend en dur.
- **Solution** : centralisation dans `API_BASE_URL` via `api.constants.ts`.

## Logo et favicon

- **Problème** : absence de favicon et de logo cohérent.
- **Solution** : ajout d'un favicon, harmonisation des icônes dans la sidebar et le header.

## Dashboard

- **Problème** : page d'accueil statique sans données réelles, erreurs de chargement.
- **Solution** : connexion au endpoint `GET /stagiaire/tableau-de-bord`, affichage conditionnel des données.

## Sidebar

- **Problème** : navigation fixe sans adaptation au rôle, éléments non fonctionnels.
- **Solution** : refonte complète avec filtrage dynamique, highlight de la page active, responsive mobile.

## Material Icons

- **Problème** : utilisation d'emojis à la place des icônes Material, icônes manquantes.
- **Solution** : remplacement systématique de tous les emojis par des `material-symbols-outlined`.

## Émojis

- **Problème** : présence d'émojis dans les titres, boutons, messages d'état.
- **Solution** : suppression complète et remplacement par du texte ou des icônes Material.

## Responsive

- **Problème** : les pages ne s'adaptaient pas aux écrans mobiles (débordement horizontal, éléments superposés).
- **Solution** : media queries, sidebar repliable, grilles passant en colonne, boutons "retour" mobile.

## Modales

- **Problème** : les fenêtres modales avaient des styles incohérents, certaines ne se fermaient pas correctement.
- **Solution** : standardisation du style des modales, overlay, animation, gestion de la fermeture.

## Imports inutilisés

- **Problème** : présence d'imports superflus dans les composants Angular.
- **Solution** : nettoyage des imports, suppression des dépendances mortes.

## Variables inutilisées

- **Problème** : variables déclarées mais jamais utilisées dans les templates ou le TypeScript.
- **Solution** : suppression des variables mortes, remplacement par des expressions directes si pertinent.

## CSS résiduel

- **Problème** : règles CSS orphelines après les refontes.
- **Solution** : nettoyage des fichiers CSS, suppression des sélecteurs inutilisés.

## Messages

- **Problème** : affichage `[object Object]` dans l'aperçu des conversations, pas de défilement automatique, titre générique.
- **Solution** : correction de l'extraction du dernier message, auto-scroll après envoi/chargement, affichage du nom du correspondant.

## Entreprise

- **Problème** : page sans connexion backend, actions non fonctionnelles.
- **Solution** : intégration complète des 10 endpoints entreprise.

## Notifications

- **Problème** : compteur de notifications non fonctionnel, pas de marquage lu/non lu.
- **Solution** : connexion au endpoint `GET /notifications`, affichage des notifications avec statut.

## Fichiers

- **Problème** : upload brisé, liste non rafraîchie après ajout.
- **Solution** : correction de l'upload avec FormData, rechargement automatique de la liste.

## Conventions

- **Problème** : statuts mal affichés, création impossible.
- **Solution** : correction de l'affichage des statuts, formulaire de création fonctionnel.

---

# 10. Optimisations du code

## Nettoyage général

- Suppression de tout le code mort (composants non utilisés, templates vides, CSS orphelin).
- Uniformisation des imports (suppression des imports inutilisés).
- Standardisation des noms de méthodes et propriétés.

## Factorisation

- Les services Angular suivent un modèle cohérent : méthodes nommées de manière similaire (`listerXxx`, `creerXxx`, `modifierXxx`, `supprimerXxx`).
- Les styles CSS utilisent des variables partagées (`var(--primary)`, `var(--surface-bright)`, etc.).
- Le composant `LayoutComponent` centralise la structure commune (sidebar + router-outlet).
- La sidebar utilise un tableau unique de routes avec filtrage par rôle.

## Composants réutilisés

- **Cartes glassmorphiques** : classe `.glass-card` utilisée dans toutes les pages.
- **Boutons** : classes `.btn`, `.btn-primary`, `.btn-outline`, `.btn-danger` uniformes.
- **Badges** : `.unread-badge` pour les compteurs, `.badge-success`, `.badge-error` pour les statuts.
- **Icônes** : utilisation systématique de `material-symbols-outlined`.

## Services

- Chaque service suit une structure homogène : injection de `HttpClient`, méthodes typées avec les interfaces, headers d'authentification via l'intercepteur.
- Gestion des erreurs centralisée via `ErrorInterceptor` et `AuthService.getErrorMessage()`.

## Styles

- Suppression des règles CSS dupliquées.
- Utilisation de variables CSS pour le thème (couleurs, espacements, arrondis).
- Media queries cohérentes sur l'ensemble des pages.

---

# 11. Fonctionnalités impossibles

Plusieurs fonctionnalités prévues dans le schéma Prisma n'ont **pas été développées** dans le frontend. La raison est systématiquement la même : **le backend ne fournit pas d'endpoint** pour ces fonctionnalités. Développer une interface frontend sans API consommable aurait créé une incohérence et une frustration utilisateur.

La position adoptée est la suivante : **ne développer que ce qui peut être réellement connecté au backend**. Les fonctionnalités listées ci-dessous sont donc volontairement absentes du frontend.

## CV

- **Tables Prisma** : `cv`, `experiences_professionnelles`
- **Problème** : aucun endpoint backend n'expose la gestion du CV ou des expériences professionnelles. Pas de `GET /stagiaire/cv`, `POST /stagiaire/cv`, etc.
- **Impact** : impossible de créer, consulter ou modifier un CV depuis le frontend.

## Compétences

- **Tables Prisma** : `competences`, `utilisateurs_competences`
- **Problème** : aucun endpoint CRUD pour les compétences. Pas de route dédiée.
- **Impact** : impossible de gérer les compétences des utilisateurs.

## Objectifs de mentorat

- **Table Prisma** : `objectifs_mentorat`
- **Problème** : aucun endpoint dans le module mentorat pour gérer les objectifs.
- **Impact** : impossible de créer ou suivre des objectifs de mentorat.

## Évaluations de mentorat

- **Table Prisma** : `evaluations_mentorat`
- **Problème** : aucun endpoint pour soumettre ou consulter les évaluations.
- **Impact** : impossible de noter les sessions de mentorat.

## Sauvegarde d'offres

- **Table Prisma** : `offres_sauvegardees`
- **Problème** : aucun endpoint pour sauvegarder/retirer des offres.
- **Impact** : impossible de permettre aux stagiaires de sauvegarder des offres pour plus tard.

## Modules de formation et progression détaillée

- **Tables Prisma** : `modules_formation`, `progressions_module`
- **Problème** : bien que `GET /stagiaire/formations/mes-formations` existe et retourne les formations avec progression, il n'y a pas d'endpoint pour :
  - Consulter les modules d'une formation
  - Marquer un module comme terminé
  - Suivre la progression détaillée par module
- **Impact** : la progression est affichée de manière globale (pourcentage), sans détail par module.

## Sessions de mentorat

- **Table Prisma** : `sessions_mentorat`
- **Problème** : aucun endpoint CRUD pour les sessions de mentorat (planification, confirmation, annulation).
- **Impact** : impossible de gérer les sessions de mentorat depuis le frontend.

## Inscription aux formations

- **Problème** : le endpoint `GET /stagiaire/formations` retourne le catalogue, `GET /stagiaire/formations/mes-formations` retourne les formations inscrites, mais il n'existe **pas d'endpoint POST** pour s'inscrire à une formation.
- **Impact** : impossible de permettre aux stagiaires de s'inscrire depuis le frontend. Les données de démonstration d'inscription sont créées directement en base de données.

## Résumé des fonctionnalités en attente

| Fonctionnalité | Modèle Prisma | Endpoint backend | Raison |
|---|---|---|---|
| CV | `cv`, `experiences_professionnelles` | ❌ Aucun | Pas d'API dédiée |
| Compétences | `competences`, `utilisateurs_competences` | ❌ Aucun | Pas d'API dédiée |
| Objectifs mentorat | `objectifs_mentorat` | ❌ Aucun | Pas d'API dédiée |
| Évaluations mentorat | `evaluations_mentorat` | ❌ Aucun | Pas d'API dédiée |
| Sauvegarde d'offres | `offres_sauvegardees` | ❌ Aucun | Pas d'API dédiée |
| Modules formation | `modules_formation`, `progressions_module` | ❌ Partiel | Liste seulement, pas de CRUD |
| Sessions mentorat | `sessions_mentorat` | ❌ Aucun | Pas d'API dédiée |
| Inscription formation | `inscriptions_formations` | ❌ Aucun post | GET seulement, pas de POST |

**Décision architecturale** : ces fonctionnalités n'ont volontairement pas été développées afin de conserver la cohérence entre le frontend et le backend. Développer des interfaces sans backend fonctionnel aurait généré des bugs, de la confusion et une dette technique inutile.

---

# 12. Données de démonstration

Pour permettre la démonstration de l'application, des données de test ont été créées directement en base de données (via des scripts SQL ou des insertions manuelles).

## Comptes de démonstration

| Rôle | Email | Mot de passe | Prénom | Nom |
|---|---|---|---|---|
| **Admin** | `admin@stageguide.com` | `Admin1234` | Super | Admin |
| **Stagiaire** | `stagiaire@test.com` | `Test1234` | Jean | Dupont |
| **Mentor** | `mentor@test.com` | `Test1234` | Pierre | Martin |
| **Entreprise** | `entreprise@test.com` | `Test1234` | Société | ABC |

## Données créées

- **Formations** : plusieurs formations dans le catalogue avec différents domaines et niveaux.
- **Certificats** : certificats attribués aux stagiaires avec hash de vérification.
- **Messages et conversations** : conversations entre les différents utilisateurs avec historique de messages.
- **Notifications** : notifications de test pour chaque profil.
- **Offres de stage et d'emploi** : plusieurs offres publiées par le compte entreprise et le partenaire.
- **Inscriptions aux formations** : inscriptions du stagiaire à certaines formations avec progression.
- **Candidatures** : candidatures soumises par le stagiaire sur des offres.
- **Conventions** : conventions à différents stades (brouillon, signée).
- **Demandes de mentorat** : demandes avec différents statuts (en attente, acceptée).
- **Projets portfolio** : projets de démonstration pour le stagiaire.
- **Partenaires** : entreprises partenaires enregistrées dans le système.

---

# 13. Difficultés rencontrées

## Incohérences backend / frontend

La principale difficulté a été de faire correspondre les attentes du frontend avec ce que le backend retourne réellement. Plusieurs endpoints retournaient des structures différentes de ce qui était documenté dans Swagger ou attendu par le frontend :

- Champs manquants dans les réponses (expéditeur non inclus dans les messages)
- Types différents entre l'interface TypeScript et le JSON retourné
- Absence de mapping pour certains champs (dernierMessage retourné comme objet alors que l'interface prévoyait une chaîne)

## Endpoints absents

Comme détaillé dans la section 11, plusieurs fonctionnalités pourtant modélisées dans Prisma ne disposent d'aucun endpoint backend. Cela a nécessité des décisions d'architecture claires pour ne pas développer inutilement du code frontend sans backend correspondant.

## Design généré nécessitant des adaptations

Le design initial, généré automatiquement ou ébauché rapidement, présentait de nombreuses incohérences qu'il a fallu corriger une par une :

- Mélange de styles (emojis, icônes, polices)
- Absence de thème unifié
- Composants sans état de chargement ou d'erreur
- Templates non responsives

## Gestion des rôles

La gestion des rôles a nécessité une attention particulière :

- **Côté backend** : chaque endpoint vérifie le rôle via le `RolesGuard`. Certains endpoints accessibles à plusieurs rôles (messages, notifications, fichiers) n'ont pas de restriction de rôle.
- **Côté frontend** : il a fallu implémenter un système de routing dynamique avec `roleGuard`, adapter la sidebar, et gérer les redirections par défaut pour chaque rôle.
- **Le rôle `TUTEUR`** : défini dans l'enum et le schéma Prisma, il n'est utilisé dans aucun endpoint. Il n'a pas été intégré au frontend.

## Progression du profil

Le calcul de la progression du profil s'est révélé complexe car il dépend de nombreux champs optionnels dont la présence varie selon le rôle. L'approche retenue a été de lister exhaustivement les champs pour chaque rôle et de calculer un ratio.

## Intégration des nouvelles pages

Chaque nouvelle page devait :

1. Consommer les endpoints backend correspondants
2. Gérer les états (chargement, vide, erreur, succès)
3. S'intégrer dans le design system existant
4. Respecter les contraintes de rôle
5. Être responsive

## Cohérence graphique

Maintenir une cohérence graphique sur 15 pages avec des composants très différents (tableaux, formulaires, cartes, fils de discussion, grilles) a nécessité la création d'un véritable design system avec des classes CSS réutilisables et des variables de thème.

## Données de démonstration

Le backend ne fournissant qu'une seed pour l'admin, il a fallu créer manuellement toutes les données de démonstration (comptes, formations, offres, messages, etc.) via des scripts SQL ou des insertions directes en base de données.

---

# 14. Résultat final

## État de l'application

L'application StageGuide est désormais **complète et fonctionnelle** dans les limites des endpoints backend disponibles.

### Ce qui fonctionne

- **Tous les endpoints backend** (57 endpoints) sont consommés par le frontend
- **Les quatre rôles** (stagiaire, mentor, entreprise, admin) disposent d'interfaces dédiées avec navigation adaptée
- **L'authentification** est complète (login, register, refresh token, logout)
- **Le design** est homogène sur l'ensemble des pages (thème sombre, glassmorphism, Material Icons)
- **La navigation** est cohérente (sidebar dynamique, guards, redirections)
- **L'administration** est complète (utilisateurs et partenaires avec toutes les actions CRUD)
- **La messagerie** est fonctionnelle (liste des conversations, fil de discussion, envoi de messages)
- **Les formulaires** sont tous connectés au backend avec validation et gestion des erreurs
- **Le responsive** est assuré sur l'ensemble des pages

### Statistiques finales

| Métrique | Valeur |
|---|---|
| Pages fonctionnelles | 15 |
| Services Angular | 16 |
| Endpoints consommés | 57 / 57 |
| Rôles gérés | 4 |
| Composants standalone | 20 |
| Fichiers d'interfaces TypeScript | 15 |
| Guards | 3 |
| Intercepteurs HTTP | 2 |

### Ce qui ne fonctionne pas (volontairement)

Les fonctionnalités listées dans la section 11 (CV, compétences, évaluations, etc.) ne sont pas développées car le backend ne fournit pas les endpoints nécessaires.

---

# 15. Conclusion

Le projet StageGuide a atteint un état de maturité fonctionnelle où **toute l'API backend disponible est consommée par le frontend** à travers une interface homogène, responsive et adaptée aux quatre rôles utilisateurs.

Le travail réalisé couvre l'intégralité du périmètre fonctionnel : de la refonte graphique complète à la connexion de chaque endpoint backend, en passant par la correction des bugs, l'optimisation du code et la création des données de démonstration.

L'application est stable, prête pour une démonstration et utilisable dans un contexte réel avec les fonctionnalités actuellement disponibles.

Les développements futurs dépendront principalement de **l'enrichissement du backend** :

1. **Ajout d'endpoints manquants** : CV, compétences, objectifs mentorat, évaluations, sessions mentorat, inscription aux formations, sauvegarde d'offres
2. **Données en temps réel** : mise en place de WebSocket pour les notifications et les messages
3. **Fonctionnalités avancées** : modules de formation détaillés, progression par module, évaluations de session
4. **Améliorations continues** : tests unitaires frontend, accessibilité, internationalisation

Le frontend Angular est architecturé de manière à pouvoir intégrer ces nouvelles fonctionnalités sans restructuration majeure, grâce à la séparation claire des modules, des services et des interfaces.
