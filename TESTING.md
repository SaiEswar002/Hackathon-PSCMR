# 🧪 Testing Setup Guide

## Quick Start

### Install Dependencies

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest jest jest-environment-jsdom ts-jest
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with verbose output
npm run test:ui
```

---

## Project Structure

```
client/src/
├── hooks/
│   ├── __tests__/
│   │   ├── useAuth.test.tsx          # Auth flow tests
│   │   ├── usePosts.test.tsx         # Feed & optimistic updates
│   │   └── useMessages.test.tsx      # Messaging & realtime (mocked)
│   ├── useAuth.tsx
│   ├── usePosts.ts
│   └── useMessages.ts
├── test-utils/
│   ├── setup.ts                      # Global test setup
│   ├── test-utils.tsx                # Custom render & helpers
│   └── mocks/
│       └── appwrite.ts               # Appwrite SDK mocks
└── ...
```

---

## What's Included

### ✅ Test Configuration
- **`jest.config.js`**: Jest configuration for TypeScript and React
- **`test-utils/setup.ts`**: Global mocks for browser APIs
- **`test-utils/test-utils.tsx`**: Custom render with providers

### ✅ Example Tests
- **Auth Flows**: Signup, login, logout, session management
- **Feed Operations**: Fetch posts, create posts, optimistic like updates
- **Messaging**: Send/receive messages, mocked realtime subscriptions

### ✅ Mock Utilities
- **Appwrite SDK Mocks**: Account, Databases, Storage, Realtime
- **Test Data Generators**: `createMockUser()`, `createMockPost()`, `createMockMessage()`

### ✅ Documentation
- **`implementation_plan.md`**: Comprehensive testing strategy
- **`MONITORING.md`**: Monitoring and logging guide for Appwrite

---

## Test Examples

### Auth Flow Test
```typescript
it('should create account and login user', async () => {
  const { result } = renderHook(() => useAuth(), { wrapper });
  
  await act(async () => {
    await result.current.signUp({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    });
  });
  
  expect(result.current.isAuthenticated).toBe(true);
});
```

### Optimistic Update Test
```typescript
it('should optimistically update like count', async () => {
  const { result } = renderHook(() => usePosts(), { wrapper });
  
  await act(async () => {
    await result.current.likePost('post-123');
  });
  
  // Like count should update immediately
  expect(result.current.posts[0].likesCount).toBe(6);
});
```

### Mocked Realtime Test
```typescript
it('should receive messages via realtime', async () => {
  mockRealtime.subscribe.mockImplementation((channels, callback) => {
    callback({ payload: newMessage });
    return () => {}; // unsubscribe
  });
  
  // Test realtime message reception
});
```

---

## Coverage Goals

| Module | Target |
|--------|--------|
| Auth hooks | 90% |
| Posts hooks | 85% |
| Messages hooks | 85% |
| Services | 80% |

---

## Next Steps

1. **Install dependencies**: `npm install --save-dev ...`
2. **Run tests**: `npm test`
3. **Review coverage**: `npm run test:coverage`
4. **Add more tests** as you build new features

---

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Plan](./implementation_plan.md)
- [Monitoring Guide](./MONITORING.md)
