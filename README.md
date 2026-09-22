# XAUUSD Pre-News Intelligence

Evidence-led pre-news intelligence for **XAUUSD only**. The project is a real static front-end and data-layer foundation, not a prediction or signal service. Missing connections remain `NULL`, `UNAVAILABLE` or `NOT CONNECTED`; no market value is invented for presentation.

## Project Overview

The dashboard is designed for the period before important US releases. It organizes:

- Next-event metadata: release time, Iran time, forecast, previous, revision and actual.
- XAUUSD context: gold, USD, Treasury yields, Fed expectations, inflation, labor and explainable geopolitical risk.
- Deterministic surprise statistics: sample size, mean, median, positive, negative and in-line counts.
- Historical reaction windows: before release, 5m, 15m, 30m and 1h, only when validated price series are available.
- Conditional scenarios: above forecast, in line and below forecast.
- Provenance, freshness, source conflicts and primary-source rationale.

The current public build intentionally reports live market data and browser research as `NOT CONNECTED`. Hugging Face can be verified in CI through a repository secret, but inference is not exposed directly from the public browser.

## Architecture

This first version uses Vanilla JavaScript ES Modules instead of React/Vite. GitHub Pages can serve it without a runtime server, the bundle has no runtime dependencies, and the domain logic is easy to test in Node. The separation keeps a future backend, React shell or Browser Agent integration from requiring a full rewrite.

```text
index.html / styles.css / app.js     browser shell and hash navigation
src/domain/                           schemas, freshness, surprise and scenarios
src/data/                             extensible US indicator taxonomy and state
src/adapters/                         fetch/parse/validate/normalize boundaries
src/services/                         repository and non-secret preferences
src/ui/                               rendering and terminal-style components
scripts/                              deterministic static build and syntax lint
tests/                                Node test runner coverage for core behavior
.github/workflows/deploy.yml          build, test, lint and GitHub Pages deployment
```

### Data Flow

```text
Provider / Browser Agent
  -> fetch
  -> parse
  -> validate
  -> normalize to Event or Price schema
  -> freshness and conflict checks
  -> deterministic calculations
  -> optional LLM explanation layer
  -> conditional UI
```

Numeric calculations do not depend on an LLM. The LLM boundary is reserved for summaries, extraction, conflict explanations and scenario wording.

## Installation

Requirements: Node.js 20 or newer.

```bash
npm install
npm test
npm run lint
npm run build
```

The build output is written to `dist/`. It can be served by any static file server.

## Environment Variables

Copy `.env.example` for a future server or data worker. The current static front-end does not read private credentials and does not accept API keys in Settings.

```text
ECONOMIC_CALENDAR_PROVIDER=not-connected
MARKET_DATA_PROVIDER=not-connected
NEWS_PROVIDER=not-connected
FED_DATA_PROVIDER=not-connected
LLM_PROVIDER=not-connected
BROWSER_AGENT_PROVIDER=not-connected
HF_TOKEN=never-commit-this
STALE_AFTER_MINUTES=30
SCENARIO_INLINE_TOLERANCE=0.05
```

Real values belong in a backend secret store or GitHub Actions secrets. For Hugging Face, add a repository secret named `HF_TOKEN`. Never put it in `app.js`, `localStorage`, `.env` committed to Git, or the browser bundle.

## Browser-only BYOK Mode

Settings includes an explicit Hugging Face **Browser-only BYOK** mode for personal use. The user can enter a token and run a real verification plus a small inference request from the current tab.

- The token is held only in JavaScript memory for the current tab.
- The input is cleared after the test; refresh, tab close or `Clear tab token` removes the connection.
- The token is not written to `localStorage`, `sessionStorage`, URL, GitHub or the build artifact.
- The browser can still inspect a key that it uses. Treat this mode as unsafe on shared or untrusted devices.
- This only connects the LLM provider. It does not create live economic-calendar, market-price or news data.

## Development

The app uses hash routes so GitHub Pages does not need server-side rewrites:

- `#/dashboard`
- `#/events`
- `#/historical`
- `#/sources`
- `#/settings`

The build script accepts `BASE_PATH` and injects runtime deployment metadata:

```bash
BASE_PATH=/finance-site/ DEPLOYMENT_STATUS=READY npm run build
```

The service worker caches the application shell only. It must not be interpreted as offline live-data support.

## Deployment

`.github/workflows/deploy.yml` runs on pushes to `main` and on manual dispatch. It:

1. Installs dependencies with Node 22.
2. Runs domain tests and syntax lint.
3. Builds with a repository-aware base path.
4. Uploads `dist/` as a Pages artifact.
5. Deploys through the official GitHub Pages Actions.

If `HF_TOKEN` exists, the workflow verifies it against Hugging Face and marks the LLM boundary `PARTIAL`. This means the credential is valid in CI; it does not claim that browser-side inference is safe or connected.

The workflow requires Pages to use **GitHub Actions** as its source. The repository owner must retain `pages: write` and `id-token: write` workflow permissions.

## Data Sources

Adapters are boundaries, not claims of a live connection. Planned primary or validation sources include:

- [BLS](https://www.bls.gov/data/) for CPI, PPI, Employment Situation, claims and JOLTS.
- [FRED](https://fred.stlouisfed.org/) for macro series validation and history.
- [BEA](https://www.bea.gov/) for GDP and PCE.
- [Federal Reserve](https://www.federalreserve.gov/) for FOMC and speaker material.
- [US Treasury](https://home.treasury.gov/resource-center/data-chart-center/interest-rates) for yield data.
- [US Census retail sales](https://www.census.gov/retail/index.html).
- [ISM](https://www.ismworld.org/supply-management-news-and-reports/reports/ism-report-on-business/) for activity releases.

The source adapter page shows the actual connection state. A URL in the registry is not presented as a retrieved observation.

## Provider Architecture

Every adapter exposes:

```js
fetch()
parse(payload)
validate(payload)
normalize(payload)
```

Normalized events use `event_id`, `indicator`, `country`, `importance`, UTC and Iran release timestamps, forecast, previous, revised previous, actual, surprise, source, source URL, retrieval time, status, confidence and notes. Price records use `symbol`, `timestamp`, `price`, `timeframe` and `source`.

The Browser Research Agent boundary requires a visible source URL, extraction timestamp, cross-check result and re-verification trace before an observation can enter the normalized layer.

## Security

- No credential or API key is shipped in the front-end.
- Settings stores only non-secret display preferences in `localStorage`.
- No provider secret is placed in README, source or test fixtures.
- Hugging Face access is read only from the GitHub Actions secret `HF_TOKEN` during CI verification.
- Browser-only BYOK is an explicit exception: the user accepts that a key used by browser JavaScript is visible to that page.
- Static GitHub Pages cannot safely proxy private provider credentials; use a backend or serverless secret boundary before connecting live feeds.

## Limitations

- No live economic calendar, market data, news, Fed or Browser Agent is connected in this version.
- Without BYOK, Hugging Face token verification is CI-only; shared-user runtime inference still needs a secure backend endpoint.
- BYOK inference is available for a user who accepts browser exposure; it is not a secure shared-user credential flow.
- Historical reaction values are unavailable until timestamped XAUUSD price data and release observations are available.
- Iran time is computed from a verified UTC release timestamp; it is never guessed from a label.
- A synchronized market move is not causal proof. Reaction tables must retain method and provenance.
- Conditional scenarios are not buy/sell recommendations and do not guarantee a direction.
- GitHub Pages provides a static shell, not a secure data-processing backend.

## Future Roadmap

1. Add a server-side calendar worker with official-source adapters and retry/backoff.
2. Add a market-data adapter with UTC-normalized OHLC and release-window calculations.
3. Add source reconciliation with field-level conflict status and primary-source rules.
4. Add Browser Use research jobs with an immutable provenance record.
5. Add a secure server-side Hugging Face inference endpoint behind deterministic numeric calculations.
6. Add a small persistence layer for observations, revisions and audit history.
7. Add alerting only after data freshness, conflict and source confidence gates are met.

## Disclaimer

This is a pre-news intelligence workspace for research and conditional analysis. It is not financial advice, a trading signal, or a guaranteed prediction system.
