# NOTHING CALCULATOR
Offline PWA: calculator, scientific mode, converter, date tools, history. Static files only: no build, no API keys.
## Run locally
`npx serve .` then open the printed URL (service workers need localhost or HTTPS).
## Deploy
1. Create a GitHub repository.
2. Upload all files in this folder to it (keep `icons/`).
3. In Vercel choose Add New Project and import the repository.
4. Leave Framework as "Other", no build command, no environment variables. Click Deploy.
5. Open the Vercel URL.
6. Install: Android Chrome, use the Install button or menu → Install app. iPhone/iPad Safari, Share → Add to Home Screen.
After changing files, bump `C` (`nc-v1`) in `sw.js` so installed copies update.
