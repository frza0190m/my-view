# MyView — katalog video (Vite + React + Vercel Functions + MongoDB Atlas)

Frontend React di `src/`, backend serverless di `api/` membaca `videodb.videos` di Atlas.

## Install
Butuh Node ≥ 20.19 (disarankan 22) dan Vercel CLI.
```bash
npm install
npm i -g vercel
```

## Isi `.env`
```bash
cp .env.example .env
```
```
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/videodb?retryWrites=true&w=majority
VITE_AUTH_USER=admin
VITE_AUTH_PASS=password-kamu
```
`MONGODB_URI` hanya dibaca oleh `/api` (server), tidak pernah masuk ke bundle frontend.
`VITE_AUTH_*` = login sederhana di browser (ikut ter-bundle, bukan pengaman data).

## Development lokal
```bash
vercel dev        # React + /api sekaligus di http://localhost:3000
```
Pertama kali, `vercel dev` akan meminta login & menautkan project.

## Deploy
```bash
vercel                         # deploy preview + buat project
vercel env add MONGODB_URI     # tempel connection string (pilih Production, Preview, Development)
vercel env add VITE_AUTH_USER
vercel env add VITE_AUTH_PASS
vercel --prod                  # deploy production
```

## Catatan Atlas
Di **Atlas → Network Access**, tambahkan `0.0.0.0/0` (Allow access from anywhere).
IP Vercel dinamis, jadi tidak bisa di-whitelist satu per satu. Pakai password database yang kuat.

## Endpoint
| Endpoint | Keterangan |
|---|---|
| `GET /api/videos?q=&folder=&page=1&limit=30&sort=newest\|title` | `{ items, total, page, pages }` |
| `GET /api/videos/:id` | `{ video, related }` (maks 12 dari folder yang sama) |
| `GET /api/folders` | `{ items: [{ name, count }] }` |
| `GET /api/stats` | `{ totalVideos, totalFolders }` |
