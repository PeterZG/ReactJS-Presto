# Presto frontend

The React presentation editor. Start the companion API in `../backend` before signing in or saving presentations.

## Development

```sh
npm ci
npm start
```

Open `http://localhost:3000`.

`REACT_APP_API_BASE_URL` defaults to `http://localhost:5005`. Set it before starting or building the client. Frontend environment values are public and must not contain secrets.

## Source

- `src/pages/`: route-level screens.
- `src/layout/`: shared page layouts.
- `src/editor/`: slide canvas and editing dialogs.
- `src/services/`: API requests and presentation storage.
- `src/state/` and `src/ui/`: shared state and controls.
- `src/tests/`: component and service tests.

## Check and build

```sh
npm run lint
npm test -- --watchAll=false
npm run build
```

The production output is written to `build/`.

## Browser tests

Build the production frontend for the isolated QA API:

```sh
REACT_APP_API_BASE_URL=http://127.0.0.1:5187 npm run build
npm run qa:browser
```

The default browser is Playwright Chromium. For installed Chrome in PowerShell:

```powershell
$env:BROWSER_CHANNEL='chrome'
npm run qa:browser
```

The script starts and stops its own real API and static server. Its accounts and database are isolated under ignored `../.qa/`; existing development data is preserved. Screenshots are written to `../docs/screenshots/`. `QA_API_URL` and `QA_PORT` allow alternate free ports; build the frontend with the same API URL.

It verifies persisted CRUD for decks/slides/elements, title and thumbnail, themes, pointer move/resize, accessible ordering, history restoration, preview, logout, network recovery, six screen widths (320/390/768/1024/1440/1920), long text and 200% enlargement. The check deliberately interrupts one API request to verify retry; other CRUD assertions use the live API.

Run `npm run qa:native-zoom` for a separate native Chrome 200% pass. It uses an automatically removed temporary profile, `viewport: null`, Chrome's actual zoom setting and the real isolated API. It checks the five main pages and key CRUD, dragging, resizing, navigation and dialogs. This is separate from the CSS/text/canvas enlargement checks above. Google Chrome must be installed; the frontend defaults to port 4174.

See the [project README](../README.md) for account settings and backend limitations.
