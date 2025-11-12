# Fanex Affiliate Landing Pages

This project has been migrated from jQuery to React for modern frontend development.

## Changes Made

### Removed
- jQuery library and all related files
- jQuery validation libraries
- jQuery unobtrusive validation

### Added
- React 18.2.0
- React DOM 18.2.0
- Webpack for bundling
- Babel for JSX transpilation

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- .NET 9.0 SDK

### Installation
1. Install npm dependencies:
   ```bash
   npm install
   ```

2. Build React components for development:
   ```bash
   npm run build:react:dev
   ```

3. Run the application:
   ```bash
   dotnet run
   ```

### Available Scripts

- `npm run build:react:dev` - Build React for development
- `npm run build:react` - Build React for production
- `npm run watch:react` - Watch mode for React development
- `npm run watch` - Watch mode for SCSS
- `npm run dev` - Run both SCSS watch and dotnet watch

## Project Structure

```
src/
├── js/
│   ├── app.js              # React entry point
│   └── components/
│       ├── App.jsx         # Main React component
│       └── ContactForm.jsx # Example form with validation
├── scss/                   # SCSS styles
wwwroot/
├── js/
│   ├── app.bundle.js       # Compiled React bundle
│   └── site.js            # Legacy JavaScript
└── lib/
    └── bootstrap/         # Bootstrap (jQuery removed)
```

## Example Components

### ContactForm
The `ContactForm` component demonstrates how to implement client-side validation without jQuery:

- Form validation using React state
- Real-time error clearing
- Bootstrap styling integration
- Success state handling

## Building for Production

The project automatically builds React components when building in Release mode:

```bash
dotnet build --configuration Release
```

## Notes

- The React app is mounted to the `#root` div in the layout
- Bootstrap is still included but no longer depends on jQuery
- All jQuery functionality should be reimplemented using React components
- The existing ASP.NET Core Razor Pages structure remains intact
- Form validation is now handled in React components instead of jQuery validation
