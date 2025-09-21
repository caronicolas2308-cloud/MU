# Maths Upload (squelette + public/)

## Démarrage local
1. `cp .env.example .env.local` et remplis les valeurs (Neon + Vercel Blob).
2. `npm install`
3. `npx prisma generate && npx prisma migrate dev --name init`
4. `npm run dev`

## Assets (public/)
- `/favicon.svg`
- `/logo.svg`
- `/robots.txt`
- `/styles.css`
- `/script.js`



## Upload PDF (branché Vercel Blob)

- Route: `POST /api/upload`
- FormData attendu:
  - `file`: PDF (obligatoire)
  - `chapterId`: number (obligatoire)
  - `title`: string (optionnel, par défaut nom du fichier)
  - `type`: enum DocType (`cours|exos|corr_exos|controle|corr_controle`), défaut `cours`

### Variables d'environnement
- `DATABASE_URL` : URL Neon pooling (Vercel)
- `DIRECT_URL` : URL Neon direct (migrations)
- `BLOB_READ_WRITE_TOKEN` : token Vercel Blob (Project Settings > Environment Variables)

### Viewer
- Page: `/viewer/[id]` — affiche le PDF (iframe) + bouton Télécharger.
