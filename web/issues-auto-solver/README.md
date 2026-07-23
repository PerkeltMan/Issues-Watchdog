# IssuesAutoSolver

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

---

## API Contract Documentation

The application assumes a RESTful API backend running at the URL specified in `environment.ts` (default: `http://localhost:3000/api`).

### Issues Endpoints

#### `GET /issues`
Fetch all issues.

**Response:**
```json
[
  {
    "id": "string (unique identifier)",
    "githubIssueId": "number",
    "title": "string",
    "description": "string",
    "status": "Open | Resolved",
    "aiSummary": "string | null",
    "severity": "Low | Medium | High | Critical | null",
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  }
]
```

#### `GET /issues/:id`
Fetch a single issue by ID.

**Response:**
```json
{
  "id": "string",
  "githubIssueId": "number",
  "title": "string",
  "description": "string",
  "status": "Open | Resolved",
  "aiSummary": "string | null",
  "severity": "Low | Medium | High | Critical | null",
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp"
}
```

#### `PATCH /issues/:id/analysis`
Save AI analysis results (aiSummary and severity) for an issue.

**Request Body:**
```json
{
  "aiSummary": "string (AI-generated summary of the issue)",
  "severity": "Low | Medium | High | Critical"
}
```

**Response:** Updated Issue object (see GET /issues/:id response).

#### `PATCH /issues/:id/status`
Update the status of an issue.

**Request Body:**
```json
{
  "status": "Open | Resolved"
}
```

**Response:** Updated Issue object.

### Codebase Endpoints

#### `GET /codebase`
Fetch a snapshot of the codebase files.

**Response:**
```json
[
  {
    "path": "string (file path relative to repo root)",
    "content": "string (file contents)"
  }
]
```

### Error Handling

All service methods return Observables and propagate HTTP errors via the error channel. Callers should handle errors using RxJS `catchError` operator or by subscribing to the error channel. No error handling is performed at the service level to allow components/features to implement context-specific error handling strategies.

