# IssueListComponent - Quick Setup Guide

## Overview
The `IssueListComponent` is a complete, production-ready Angular component that displays a list of issues with auto-analysis capabilities using AI via OpenRouter API.

## Quick Start

### 1. Verify Dependencies
Angular Material and CDK have been installed:
```bash
npm list @angular/material @angular/cdk
```

### 2. Configure Environment
Update the API base URL in your environment files:

**Development** (`src/environments/environment.ts`):
```typescript
export const environment = {
  apiBaseUrl: 'http://localhost:3000/api',
  openRouterApiKey: 'your-api-key-here',
  openRouterModel: 'openai/gpt-4-turbo',
};
```

**Production** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  apiBaseUrl: '/api', // or your production API URL
  openRouterApiKey: 'your-api-key-here',
  openRouterModel: 'openai/gpt-4-turbo',
};
```

### 3. Backend API Requirements

The backend API should provide these endpoints:

#### GET /api/issues
Returns an array of issues:
```typescript
{
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'Resolved';
  createdAt: Date;
  updatedAt: Date;
  aiSummary?: string;
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
}[]
```

#### PATCH /api/issues/:id/analysis
Updates an issue with AI analysis:
```typescript
// Request body:
{
  aiSummary: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

// Response: Updated Issue object
{
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'Resolved';
  createdAt: Date;
  updatedAt: Date;
  aiSummary: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}
```

### 4. Start Development Server
```bash
npm start
```

The component will be available at `http://localhost:4200/`

## Component Architecture

### Key Classes and Methods

**IssueListComponent**
- `loadIssues()` - Fetches issues from API
- `refresh()` - Manual refresh button handler
- `analyzeIssuesSequentially()` - Auto-analyzes unanalyzed issues
- `analyzeIssue()` - Analyzes single issue
- `updateIssueInList()` - Updates UI without full reload

**IssuesApiService**
- `getIssues(): Observable<Issue[]>` - Fetch all issues
- `saveAnalysis(id, data): Observable<Issue>` - Save analysis results

**Helper Functions**
- `isIssueAnalyzed(issue): boolean` - Check if issue is analyzed

## Data Flow

```
1. Component Init
   ↓
2. Load Issues (IssuesApiService.getIssues)
   ↓
3. Detect Unanalyzed Issues
   ↓
4. Auto-Analyze (with concurrency limit of 2)
   ├─ OpenRouterService.generateIssueAnalysis()
   ├─ IssuesApiService.saveAnalysis()
   └─ Update UI signal (no reload needed)
   ↓
5. Display Complete Issue List with Analysis
```

## UI Indicators

| State | Indicator |
|-------|-----------|
| Loading | Spinner + "Loading issues..." |
| Empty | Icon + "No issues found" |
| Analyzing | "Analyzing..." chip + spinning icon |
| Error | Error icon with tooltip |
| Ready | Complete table with all columns |

## Features

✅ Real-time UI updates using Angular signals
✅ Automatic analysis with concurrency control
✅ Error handling with inline indicators
✅ Material Design components
✅ Responsive mobile layout
✅ Smooth loading states
✅ Manual refresh capability

## Customization

### Change Concurrency Limit
In `issue-list.component.ts`, modify the `mergeMap` call:
```typescript
// Current: 2 concurrent requests
mergeMap((issue) => this.analyzeIssue(issue), 2)

// Change to 3 concurrent requests
mergeMap((issue) => this.analyzeIssue(issue), 3)
```

### Change Severity Colors
In `issue-list.component.scss`, update the color values:
```scss
mat-chip.severity-critical {
  background-color: #your-color;
  color: white;
}
```

### Change Table Columns
Update the `displayedColumns` array in the component:
```typescript
displayedColumns: string[] = [
  'title',
  'status',
  'severity',
  'aiSummary',
  'actions',
];
```

## Troubleshooting

### Issues Not Loading
1. Check browser console for errors
2. Verify API URL is correct in environment.ts
3. Ensure backend is running and accessible

### Analysis Not Starting
1. Check OpenRouter API key is set
2. Verify backend `/api/issues/:id/analysis` endpoint is working
3. Check browser console for error details

### UI Not Updating
1. Verify Angular version is 21+
2. Check that signals are being used correctly
3. Ensure CD strategy is not OnPush (not set here)

## Performance Considerations

- Concurrency limit of 2 prevents API rate limiting
- Issues are updated in-place to avoid full re-renders
- Table uses trackBy where needed for optimized rendering
- Lazy-loaded Material components via standalone imports

## Next Steps

1. **Detail View**: Create `/issues/:id` detail component
2. **Batch Operations**: Add select/deselect for bulk analysis
3. **Filtering**: Add status/severity filters
4. **Pagination**: Implement for large issue lists
5. **Export**: Add CSV/PDF export functionality

