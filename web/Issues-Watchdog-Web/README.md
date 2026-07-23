# IssuesWatchdogWeb

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.19.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Running the demo

Before running the demo, set the following environment values (either by editing the files under `src/environments/` for local testing or by supplying appropriate build-time env values):

- `apiBaseUrl` — base URL for the backend API (e.g. `http://localhost:3000/api`)
- `openRouterApiKey` — API key for OpenRouter (used to call the LLM)
- `openRouterModel` — model id to use (defaults to `openai/gpt-4-turbo`)
- `n8nWebhookUrl` — webhook URL where accepted auto-fix payloads will be POSTed

Install dependencies and run the dev server:

```bash
npm install
ng serve
```

Assumed backend contract (brief):

The UI expects a backend at `apiBaseUrl` exposing these endpoints:

GET    /api/issues                -> returns Issue[]
GET    /api/issues/:id            -> returns Issue
PATCH  /api/issues/:id/status     -> updates issue status
GET    /api/codebase/snapshot     -> returns codebase files for AI context
PATCH  /api/issues/:id/analysis   -> accepts { aiSummary, severity } to update analysis

The UI also POSTs accepted auto-fix payloads to the configured `n8nWebhookUrl` for downstream processing.

