# IssueDetailComponent - Quick Reference Guide

## Overview
The IssueDetailComponent provides a complete workflow for viewing issues and generating AI-powered fixes using the OpenRouter API and n8n webhooks.

## Component Usage

### Route Navigation
Users can navigate to an issue detail page via:
- **Route**: `/issues/:id` (e.g., `/issues/123-abc`)
- **Programmatically**: 
  ```typescript
  this.router.navigate(['/issues', issueId]);
  ```
- **From Issue List**: Click the arrow icon in the Actions column

## User Workflow

### 1. View Issue Details
- Navigate to `/issues/:id`
- Component automatically loads the issue from the backend API
- Displays:
  - Issue title, description, and status
  - Severity level (if analyzed)
  - AI summary (if available)
  - Created and updated timestamps
  - Loading spinner while fetching

### 2. Generate AI Fix
1. Click the "AI Auto Fix" button (disabled if issue is already "Resolved")
2. Workflow:
   - Fetches current codebase snapshot from backend
   - Sends issue + codebase to OpenRouter API
   - Receives proposed code changes and explanation
   - Opens a dialog showing the proposed fix
3. Loading state shows: "Generating fix…"

### 3. Review Fix Preview
The AutoFixPreviewDialogComponent displays:
- **AI's Explanation**: Why these changes fix the issue
- **Proposed Changes**: 
  - One card per file
  - File path at the top
  - Complete new file content in a code block
  - Syntax-highlighted for readability

### 4. Accept or Reject Fix
- **Cancel**: Closes dialog without taking action
- **Accept**: 
  - Shows "Submitting…" state with spinner
  - Submits fix payload to n8n webhook
  - Shows success message on completion
  - Does NOT mark issue as resolved locally (backend handles this)

### 5. Success Feedback
- Success snackbar: "Fix submitted — n8n is applying it now."
- Dialog closes automatically
- Backend status update will be reflected via notification service

## API Endpoints Required

### Backend API Endpoints
```
GET    /api/issues              - List all issues
GET    /api/issues/:id          - Get a specific issue
PATCH  /api/issues/:id/status   - Update issue status
GET    /api/codebase/snapshot   - Get codebase files for context
PATCH  /api/issues/:id/analysis - Save AI analysis results
```

### External Services
- **OpenRouter API**: Handles AI fix generation
  - Environment: `openRouterApiKey`, `openRouterModel`
  - Model: 'openai/gpt-4-turbo' (configurable)
  
- **n8n Webhook**: Handles fix submission and application
  - Environment: `n8nWebhookUrl`
  - Expects: AutoFixPayload { issueId, changes[] }

## Component Signals (State Management)

```typescript
issue: Signal<Issue | null>           // Current issue being viewed
isLoading: Signal<boolean>            // Fetching issue from API
isNotFound: Signal<boolean>           // Issue doesn't exist
isGeneratingFix: Signal<boolean>      // Generating fix via OpenRouter
isSubmittingFix: Signal<boolean>      // Submitting fix to n8n
```

## Error Handling

The component handles multiple error scenarios:

| Scenario | Behavior |
|----------|----------|
| Issue not found | Shows "Issue Not Found" page |
| API load error | Shows error message, allows retry |
| Codebase fetch fails | Error snackbar, stays on issue page |
| Fix generation fails | Error snackbar with details |
| Fix submission fails | Error snackbar, dialog stays open for retry |

## Dialog Component (AutoFixPreviewDialogComponent)

### Input Data
```typescript
explanation: string      // AI's explanation of the fix
changes: CodeChange[]    // Array of proposed file changes
isSubmitting: Signal<boolean>  // Show loading state
```

### Output Data
```typescript
// On Cancel:
null

// On Accept:
{
  accepted: true,
  changes: CodeChange[]
}
```

### Dialog Styling
- Max width: 800px (90vw on mobile)
- Max height: 90vh with scrollable content
- Material design with proper spacing

## Key Features

✅ **Responsive Design**: Works on desktop and mobile
✅ **Loading States**: Clear feedback for all async operations
✅ **Error Handling**: Graceful errors with helpful messages
✅ **Accessibility**: Tooltips for disabled buttons
✅ **Type Safety**: Full TypeScript support throughout
✅ **Performance**: Uses signals for efficient change detection
✅ **Navigation**: Easy back navigation to issues list

## Styling Classes (SCSS)

### Status Chips
- `.status-resolved` - Green background (Resolved)
- `.status-open` - Orange background (Open)

### Severity Chips
- `.severity-low` - Gray
- `.severity-medium` - Blue
- `.severity-high` - Orange
- `.severity-critical` - Red

### Other Classes
- `.spinner-icon` - Animated rotation
- `.button-content` - Flexbox wrapper for button content
- `.description-text` - Light gray background for text areas
- `.ai-summary` - Light blue background with left border

## Testing the Implementation

1. **Test Navigation**:
   ```bash
   npm start
   # Navigate to http://localhost:4200/issues/test-id
   ```

2. **Test Loading States**:
   - Check if spinner appears while fetching
   - Verify error state if endpoint is down

3. **Test Auto Fix Flow**:
   - Click "AI Auto Fix" button
   - Verify OpenRouter API is called
   - Check dialog appears with changes
   - Try Cancel and Accept buttons

4. **Test Error Cases**:
   - Disable n8n webhook to test error handling
   - Verify error messages appear in snackbars
   - Verify dialog stays open for retry

## Development Notes

### Adding to Existing Projects
1. Services are already integrated in the app
2. Routes are configured in app.routes.ts
3. Material theme must be configured (existing setup works)
4. Environment variables must include:
   - `apiBaseUrl`
   - `openRouterApiKey`
   - `openRouterModel`
   - `n8nWebhookUrl`

### Customization Points
- Change dialog width in `openPreviewDialog()` method
- Modify chip colors in SCSS
- Adjust spinner animation timing
- Customize snackbar duration/position

### Performance Considerations
- Codebase snapshot is fetched fresh each time (no caching)
- Consider adding cache if same codebase is used frequently
- Dialog content is not virtualized (OK for typical use)
- Implement pagination for very large file changes if needed

## Future Enhancements

Possible improvements:
1. Add diff view comparing old vs new content
2. Implement file-by-file accept/reject
3. Add rate limiting with countdown
4. Cache generated fixes for re-submission
5. Add rollback functionality if n8n fails
6. Implement fix history/audit trail
7. Add webhook status tracking

