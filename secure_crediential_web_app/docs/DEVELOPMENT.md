# Development Guide

## Project Structure

```
keyyatri/
├── src/
│   ├── components/    # React components
│   ├── lib/          # Utility functions
│   ├── types/        # TypeScript types
│   └── App.tsx       # Main application
├── docs/             # Documentation
├── supabase/         # Database migrations
└── public/           # Static assets
```

## Technology Stack

- Frontend:
  - React 18
  - TypeScript
  - Tailwind CSS
  - Vite
- Backend:
  - Supabase
  - PostgreSQL
- Tools:
  - ESLint
  - Docker
  - Git

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Run tests:
   ```bash
   npm test
   ```

## Code Style

### TypeScript
- Use strict mode
- Explicit types
- Interface over type
- Avoid any

### React
- Functional components
- Custom hooks
- Props validation
- Error boundaries

### CSS
- Tailwind classes
- Mobile-first
- BEM naming (when needed)
- CSS modules

## Testing

### Unit Tests
- Component testing
- Utility function testing
- Mock external services

### Integration Tests
- API integration
- Database operations
- Authentication flows

## Git Workflow

1. Create feature branch
2. Make changes
3. Run tests
4. Create pull request
5. Code review
6. Merge to main

## Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm run preview
```

### Docker
```bash
docker-compose up --build
```

## Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Submit pull request

## Best Practices

### Code
- DRY principle
- SOLID principles
- Clean code
- Documentation

### Security
- Input validation
- Error handling
- Security headers
- Regular updates

### Performance
- Code splitting
- Lazy loading
- Image optimization
- Caching