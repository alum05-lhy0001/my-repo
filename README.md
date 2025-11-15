Prime checker conversion

This folder contains a Java example (`Prime.java`) and two JavaScript variants that reproduce the same behavior:

- `Prime.js` — Node.js interactive CLI that prompts for a number and prints whether it's prime and its factors.
- `prime.html` — Simple browser page suitable for deploying to GitHub Pages.

How to run (Node)

1. Install Node.js if you don't have it: https://nodejs.org/
2. Run:

```powershell
node Prime.js
```

Usage examples

- Interactive prompt (default):

```powershell
node Prime.js
```

- Single-number CLI (non-interactive):

```powershell
node Prime.js 17
```

- JSON output (useful for automation):

```powershell
node Prime.js 21 --json
```

- Piped input (works with or without `--json`):

```powershell
echo 12 | node Prime.js --json
```

How to deploy the browser version to GitHub Pages

1. Create a repository on GitHub and push these files.
2. In repository settings enable GitHub Pages and select the branch (usually `main`) and folder (`/` or `/docs`).
3. Open `https://<your-username>.github.io/<repo-name>/prime.html`.

Notes

- This is a manual port of the logic in `Prime.java`. If you want an automated transpilation of compiled Java bytecode (`.class`) to JavaScript, there are tools such as CheerpJ or TeaVM, but they add complexity.
- Tell me if you want the Node script to accept a command-line argument (e.g., `node Prime.js 17`) or to output JSON for CI usage.
