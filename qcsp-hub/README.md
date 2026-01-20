# QCSP Hub

Central marketplace for all QCSP applications and services.

## Development

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:8081`

## Build

```bash
npm run build
```

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- React Router

## Adding a New App to the Marketplace

Edit `src/pages/Index.tsx` and add a new entry to the `apps` array:

```tsx
{
  id: 'your-app',
  name: 'Your App Name',
  description: 'Description of what your app does.',
  icon: YourIcon, // from lucide-react
  path: '/your-app',
  color: 'hsl(199, 89%, 48%)', // your brand color
  status: 'active', // or 'coming-soon', 'beta'
}
```
