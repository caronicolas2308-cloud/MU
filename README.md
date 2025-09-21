# Maths Upload - Plateforme Éducative

Maths Upload est une plateforme éducative destinée à héberger et partager des documents pédagogiques (cours, exercices, corrigés, contrôles) en format PDF exclusivement.

## 🎯 Fonctionnalités Principales

### Vue Élève (Publique)

- **Accès libre** sans inscription ni connexion
- **Navigation intuitive** via méga-menu avec sélection professeur → classe
- **Progression complète** avec chapitres et rubriques SERENA
- **Visualiseur PDF intégré** avec scroll, zoom (50%-150%), et téléchargement
- **Protection par mot de passe** pour les documents sensibles
- **Watermarking automatique** sur tous les PDF téléchargés

### Vue Professeur

- **Gestion des classes** avec création et modification
- **Système de progression** avec chapitres (minimum 2 obligatoires)
- **Rubriques SERENA automatiques** : Cours, Exercices, Correction Exos, Contrôle, Correction Contrôle
- **Upload de documents** avec drag-and-drop, validation PDF, protection par mot de passe
- **Limite de 10 pages** par PDF et 10MB maximum
- **Organisation par classe et chapitre**

### Vue Administrateur

- **Gestion des professeurs** (création, modification, suppression)
- **Gestion des classes** de tous les professeurs
- **Paramètres globaux** : limites, sésame d'inscription, mot de passe maître
- **Vue d'ensemble** de toute la plateforme

## 🏗️ Architecture Technique

### Stack Technologique

- **Frontend** : Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend** : Next.js API Routes
- **Base de données** : PostgreSQL avec Prisma ORM
- **Stockage** : Vercel Blob pour les fichiers PDF
- **Visualisation PDF** : PDF.js 4.3.136

### Structure de la Base de Données

```sql
- Setting (paramètres globaux)
- Admin (comptes administrateurs)
- Prof (comptes professeurs)
- Class (classes créées par les profs)
- Chapter (chapitres de chaque classe)
- Document (PDFs uploadés)
- Session (sessions utilisateurs)
```

### Rubriques SERENA

Chaque chapitre génère automatiquement 5 rubriques :

1. **Cours** - Leçons théoriques
2. **Exercices** - Problèmes à résoudre
3. **Correction Exos** - Solutions des exercices
4. **Contrôle** - Évaluations
5. **Correction Contrôle** - Corrigés des contrôles

## 🚀 Installation et Déploiement

### Prérequis

- Node.js 18+
- PostgreSQL
- Compte Vercel (pour le stockage Blob)

### Configuration

1. **Variables d'environnement** :

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
BLOB_READ_WRITE_TOKEN="vercel_blob_token"
```

2. **Installation des dépendances** :

```bash
npm install
```

3. **Configuration de la base de données** :

```bash
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

4. **Démarrage du serveur** :

```bash
npm run dev
```

## 📱 Utilisation

### Pour les Élèves

1. Accédez à la page d'accueil (Vue Élève)
2. Utilisez le menu "Vue Élève" pour sélectionner un professeur
3. Choisissez une classe dans la liste déroulante
4. Naviguez dans la progression ou utilisez le menu "Chapitres"
5. Cliquez sur les documents disponibles (Cours, Exercices, etc.)
6. Utilisez le visualiseur PDF intégré ou téléchargez

### Pour les Professeurs

1. Inscrivez-vous avec le sésame fourni par l'admin
2. Créez vos classes via "Création d'une classe"
3. Organisez vos chapitres dans "Gérer cette classe"
4. Uploadez vos PDF via "Uploader un Cours/Exo/Contrôle/Corrigé"
5. Protégez vos documents sensibles par mot de passe

### Pour les Administrateurs

1. Connectez-vous avec vos identifiants admin
2. Gérez les professeurs et leurs classes
3. Configurez les paramètres globaux
4. Modifiez le sésame d'inscription des professeurs

## 🔒 Sécurité

- **Authentification** par sessions sécurisées
- **Protection par mot de passe** pour les documents sensibles
- **Validation stricte** des fichiers PDF
- **Limites de taille** et de pages
- **Watermarking** pour la traçabilité

## 🎨 Interface Utilisateur

- **Design minimaliste** et intuitif
- **Méga-menus** pour une navigation claire
- **Responsive** sur tous les appareils
- **Feedback visuel** pour toutes les actions
- **Instructions contextuelles** pour guider l'utilisateur

## 📊 Limites et Contraintes

- **Maximum 10 professeurs** (configurable)
- **Maximum 10 classes par professeur** (configurable)
- **Maximum 10 pages par PDF**
- **Maximum 10MB par fichier**
- **Format PDF exclusivement**

## 🔧 Maintenance

### Sauvegarde

- Base de données PostgreSQL
- Fichiers PDF sur Vercel Blob
- Configuration des paramètres

### Monitoring

- Logs des erreurs dans la console
- Suivi des uploads et téléchargements
- Gestion des sessions utilisateurs

## 📝 Changelog

### Version 1.0.0

- ✅ Vue Élève publique complète
- ✅ Système de connexion/inscription
- ✅ Gestion des classes et chapitres
- ✅ Upload de documents avec validation
- ✅ Visualiseur PDF intégré
- ✅ Protection par mot de passe
- ✅ Watermarking automatique
- ✅ Interface administrateur
- ✅ API complète

## 🤝 Contribution

Ce projet est développé selon les spécifications du cahier des charges Maths Upload. Toute modification doit respecter l'architecture existante et les contraintes de sécurité.

## 📄 Licence

Projet éducatif - Tous droits réservés.
