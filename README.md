# PULSE — Personal Expense Tracker

PULSE is a private expense tracker that runs in your browser and can be **installed on your phone** like an app. It works offline. Your data stays on your device.

**Features:** dashboard, income & expense tracking, automatic balance, monthly budget, add/edit/delete, category breakdown, six-month cash-flow chart, search & filters, **backup & restore (new)**, **installable & offline (new)**.

## Files in this project

| File | What it does |
|---|---|
| `index.html` | The whole app (HTML + CSS + JavaScript) |
| `manifest.webmanifest` | Tells the phone the app's name (PULSE), colours, icons and "standalone" display |
| `sw.js` | The service worker: saves the app on your device so it opens offline |
| `icons/icon-192.png`, `icons/icon-512.png` | App icons |
| `icons/icon-maskable-512.png` | Extra-padded icon so Android can crop it to a circle/squircle without cutting the "P" |
| `README.md` | This file |

All paths are relative, so the project works at `https://<username>.github.io/pulse-expense-tracker/`.

## Publish on GitHub Pages

Do this from a computer if you can (uploading folders is easier).

1. Open your repository `pulse-expense-tracker` on github.com.
2. Click **Add file → Upload files**.
3. Drag in `index.html`, `manifest.webmanifest`, `sw.js`, `README.md` **and the whole `icons` folder**. Files with the same name will be replaced.
4. Write a message like `Add PWA support and backup/restore`, then click **Commit changes** (on `main`).
5. Wait 1–2 minutes. Open `https://<username>.github.io/pulse-expense-tracker/`.

**Check it worked** (Chrome on a computer): press F12 → **Application** tab → *Manifest* shows name PULSE and three icons; *Service workers* shows `sw.js` as "activated".

## Install on Android

1. Open the GitHub Pages address in **Chrome**.
2. Tap **⋮ → Install app** (or **Add to Home screen**). A **📲 Install PULSE** button may also appear at the bottom of the page.
3. Open PULSE from its new home-screen icon. It opens full-screen, with no browser bars.

## Test offline

1. Open PULSE once while online (this lets it save itself).
2. Turn on airplane mode.
3. Open PULSE from the home screen. It should load and show your transactions; adding a transaction works too.

## Back up and restore your data

Use the **Backup & restore** card (below the transactions list).

- **Export backup** downloads `pulse-backup-YYYY-MM-DD.json` containing your transactions and monthly budget.
- **Import backup** reads a backup file, **checks every row**, and shows a preview before changing anything:
  - **Add new only** (safe): keeps your current data and adds only transactions you don't already have.
  - **Replace all**: swaps your data for the file's (asks you to confirm first).
  - Before any import PULSE keeps a safety copy; **Undo last import** brings it back.
- Bad rows (missing title, negative amount, impossible date…) are skipped and counted. A wrong or damaged file changes nothing.

Tip: export a backup regularly and keep the file in Google Drive or email it to yourself.

## Where your data lives (important)

PULSE saves transactions in your browser's **LocalStorage**. Browsers keep a separate LocalStorage for each **origin** (the address the page is opened from):

- Opening the HTML as a **local file** (`file://...`) is one origin.
- Opening **`https://<username>.github.io/...`** is a completely different origin.

So transactions you entered in the local file **do not appear automatically** on the website or in the installed app. They are not lost; they sit in the old place. Also, clearing site data for PULSE in Chrome erases that origin's data, which is why backups matter.

### Move your old data to the website

1. Open the **new** `index.html` from your computer/phone **the same way and in the same browser** you used for the old file. If your old transactions appear, tap **Export backup**.
2. Open the GitHub Pages site (or the installed app) → **Import backup** → choose the file.
3. Check the numbers, then you're done.

If the old transactions don't show up in step 1 (for example, a different browser, or a file opened through an Android file manager), they can't be read from the new file. Re-enter them by hand, or import a backup if you made one.

## Updating PULSE later

1. Edit the files and upload them to GitHub as above.
2. In `sw.js`, change `const CACHE_NAME = "pulse-v1";` to `"pulse-v2"` (then v3, …) so old saved copies are cleaned up.
3. Open PULSE online; it shows "New version ready". Close and reopen it to use the update.

## Troubleshooting

- **No Install option:** open the HTTPS address in Chrome (not inside another app), reload once, wait a few seconds.
- **Still seeing an old version:** close the app fully and reopen it while online; bump `CACHE_NAME` if needed.
- **Data missing:** you're probably on a different origin (see above). Use Import backup.

## Next step (planned, not done yet)

Publishing to Google Play can be done by wrapping this PWA in a Trusted Web Activity (for example with PWABuilder or Bubblewrap). It needs a Google Play developer account and a signed app bundle.
