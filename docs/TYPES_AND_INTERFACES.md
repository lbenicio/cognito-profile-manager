# Types and Interfaces Documentation

This document provides a comprehensive overview of the reorganized type system for the Cognito Profile Manager application. The codebase now follows a clear separation between **types** (type aliases, unions, enums) and **interfaces** (object shapes, contracts).

## Overview

The application now has a well-organized type system with a clear separation of concerns:

```
src/
├── types/                          # Type aliases, unions, and enums only
│   ├── index.ts                    # Main type exports
│   ├── auth.types.ts              # Authentication type aliases
│   ├── session.types.ts           # Session type aliases
│   ├── api/
│   │   └── response.types.ts      # API response type aliases
│   ├── forms/                     # Form validation schemas
│   ├── user/
│   │   └── user.types.ts          # User domain types
│   └── ...
└── interfaces/                    # Interfaces and object contracts only
    ├── index.ts                   # Main interface exports
    ├── auth/
    │   └── auth.interfaces.ts     # Authentication interfaces
    ├── session/
    │   └── session.interfaces.ts  # Session interfaces
    ├── api/
    │   └── response.interfaces.ts # API response interfaces
    ├── actions/
    │   └── action.interfaces.ts   # Server action interfaces
    ├── error/
    │   └── error.interfaces.ts    # Error handling interfaces
    ├── components/                # React component prop interfaces
    ├── forms/                     # Form prop interfaces
    └── ...
```

## Architecture Principles

### 1. **Clear Separation**

- **`/types/`**: Contains only type aliases, union types, enums, and simple type definitions
- **`/interfaces/`**: Contains only interface definitions, object shapes, and contracts

### 2. **Domain Organization**

Both directories are organized by domain/module:

- `auth/` - Authentication and authorization
- `session/` - Session management
- `api/` - API contracts and responses
- `actions/` - Server action results
- `error/` - Error handling
- `components/` - React component props
- `forms/` - Form validation and props

### 3. **Import Strategy**

```typescript
// Import types (unions, aliases, enums)
import type { AuthState, AuthMethod } from '@/types/auth.types';

// Import interfaces (object shapes)
import type {
  AuthUser,
  LoginCredentials,
} from '@/interfaces/auth/auth.interfaces';

// Convenience imports from main index files
import type { AuthUser, AuthState } from '@/types'; // Re-exports from both
import type { BaseActionResult } from '@/interfaces';
```

## Type System Components

### 1. Authentication System

#### Types (`/types/auth.types.ts`)

```typescript
export type AuthState =
  | 'authenticated'
  | 'unauthenticated'
  | 'loading'
  | 'error';
export type AuthMethod = 'sso' | 'passkey' | 'mfa' | 'password' | 'mock';
export type UserRole = 'user' | 'admin' | 'moderator' | 'viewer';
export type AccountStatus =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'pending_verification';
```

#### Interfaces (`/interfaces/auth/auth.interfaces.ts`)

```typescript
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  name: string;
  groups: string[];
  isAdmin: boolean;
  twoFactorEnabled: boolean;
  passkeysEnabled: boolean;
}

export interface LoginCredentials {
  username?: string;
  email?: string;
  password?: string;
  mfaCode?: string;
  rememberMe?: boolean;
}

export interface AuthContext {
  state: AuthState;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
}
```

### 2. Session Management

#### Types (`/types/session.types.ts`)

```typescript
export type SessionInvalidReason = 'NOT_FOUND' | 'EXPIRED' | 'INVALID_TOKEN';
export type SessionAction =
  | 'SESSION_CREATED'
  | 'SESSION_REFRESHED'
  | 'LOGIN_SUCCESS';
export type SessionStatus = 'active' | 'expired' | 'revoked' | 'suspended';
export type LogoutType = 'local' | 'global' | 'forced' | 'expired';
```

#### Interfaces (`/interfaces/session/session.interfaces.ts`)

```typescript
export interface AuthSession extends BaseSession {
  accessToken: string;
  refreshToken?: string;
  claims: SessionClaims;
  userId: string;
  fingerprint?: SessionFingerprint;
}

export interface SessionManager {
  create(params: CreateSessionParams): Promise<AuthSession>;
  validate(sessionId: string): Promise<SessionValidation>;
  invalidate(sessionId: string): Promise<boolean>;
}
```

### 3. API Response System

#### Types (`/types/api/response.types.ts`)

```typescript
export type HttpStatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 500;
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ApiResponseStatus = 'success' | 'error' | 'pending' | 'timeout';
export type ExportFormat = 'csv' | 'json' | 'pdf' | 'xlsx';
```

#### Interfaces (`/interfaces/api/response.interfaces.ts`)

```typescript
export interface BaseApiResponse {
  success: boolean;
  message: string;
}

export interface ApiResponse<T = unknown> extends BaseApiResponse {
  data?: T;
}

export interface PaginatedApiResponse<T = unknown>
  extends ApiSuccessResponse<T[]> {
  pagination: PaginationMeta;
}
```

### 4. Server Actions

#### Interfaces (`/interfaces/actions/action.interfaces.ts`)

```typescript
export interface BaseActionResult {
  success: boolean;
  message: string;
  timestamp?: number;
}

export interface FormActionResult<T = unknown> extends ActionResult<T> {
  fieldErrors?: Record<string, string[]>;
  formError?: string;
}

export interface ProfileUpdateResult extends BaseActionResult {
  updatedFields?: string[];
}
```

### 5. Error Handling

#### Types (`/types/error.types.ts`)

```typescript
export type ApplicationError =
  | AuthError
  | ValidationError
  | ApiError
  | CognitoError;
```

#### Interfaces (`/interfaces/error/error.interfaces.ts`)

```typescript
export interface AppError {
  name: string;
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export interface AuthError extends AppError {
  name: 'AuthError';
  code: 'AUTHENTICATION_REQUIRED' | 'INVALID_CREDENTIALS' | 'TOKEN_EXPIRED';
}
```

### 6. Component Props

All React component props are defined as interfaces in `/interfaces/components/`:

```typescript
// /interfaces/components/avatar-editor.interfaces.ts
export interface AvatarEditorProps {
  user: User;
  onUpdateAction: (data: Partial<User>) => void;
  onCloseAction: () => void;
}
```

### 7. Form Validation

Form schemas (zod) remain in `/types/forms/` while form prop interfaces are in `/interfaces/forms/`:

```typescript
// /types/forms/account-form.types.ts (zod schema)
export const accountFormSchema = (t: (key: string) => string) =>
  z.object({
    given_name: z.string().min(1),
    family_name: z.string().min(1),
    // ...
  });

// /interfaces/forms/account-form.interfaces.ts (component props)
export interface AccountFormProps {
  user: User;
  onUpdateAction: (data: Partial<User>) => void;
}
```

## Usage Examples

### 1. Server Actions with Proper Typing

```typescript
// /lib/profile-actions.ts
import type { ProfileUpdateResult } from '@/interfaces/actions/action.interfaces';

export async function updateUserProfile(
  profileData: ProfileFormValues
): Promise<ProfileUpdateResult> {
  try {
    // Update logic
    return {
      success: true,
      message: 'Profile updated successfully',
      updatedFields: ['name', 'email'],
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to update profile',
      timestamp: Date.now(),
    };
  }
}
```

### 2. React Components with Interface Props

```typescript
// /components/profile-form.tsx
import type { ProfileFormProps } from '@/interfaces/forms/profile-form.interfaces';
import type { AuthState } from '@/types/auth.types';

export function ProfileForm({ user, onUpdateAction }: ProfileFormProps) {
  const [state, setState] = useState<AuthState>('loading');
  // Component implementation
}
```

### 3. API Responses with Mixed Types

```typescript
// /lib/api-client.ts
import type { ApiResponse } from '@/interfaces/api/response.interfaces';
import type { HttpMethod, HttpStatusCode } from '@/types/api/response.types';

async function makeRequest<T>(
  method: HttpMethod,
  url: string
): Promise<ApiResponse<T>> {
  // API call implementation
}
```

### 4. Error Handling with Type Guards

```typescript
// /lib/error-handler.ts
import type { AppError } from '@/interfaces/error/error.interfaces';
import type { ApplicationError } from '@/types/error.types';
import { isAuthError, isValidationError } from '@/types/error.types';

function handleError(error: ApplicationError): void {
  if (isAuthError(error)) {
    // Handle authentication error
    console.error('Auth error:', error.code);
  } else if (isValidationError(error)) {
    // Handle validation error
    console.error('Validation errors:', error.fieldErrors);
  }
}
```

## Migration Guide

### Before (Old Structure)

```typescript
// Everything mixed in types/
import type { AuthUser, AuthState } from '@/types/auth.types';
```

### After (New Structure)

```typescript
// Clear separation
import type { AuthState } from '@/types/auth.types'; // Type alias
import type { AuthUser } from '@/interfaces/auth/auth.interfaces'; // Interface

// Or use convenience re-exports
import type { AuthUser, AuthState } from '@/types'; // Both available
```

## Best Practices

### 1. **When to Use Types vs Interfaces**

**Use Types (`/types/`) for:**

- Union types: `type Status = 'loading' | 'success' | 'error'`
- Type aliases: `type UserId = string`
- Enums: `enum LogLevel { DEBUG, INFO, WARN, ERROR }`
- Mapped types: `type Partial<T> = { [P in keyof T]?: T[P] }`

**Use Interfaces (`/interfaces/`) for:**

- Object shapes: `interface User { id: string; name: string }`
- Component props: `interface ButtonProps { onClick: () => void }`
- API contracts: `interface ApiResponse<T> { data: T }`
- Class contracts: `interface Logger { log(message: string): void }`

### 2. **Import Conventions**

```typescript
// Specific imports (preferred for clarity)
import type { AuthState } from '@/types/auth.types';
import type { AuthUser } from '@/interfaces/auth/auth.interfaces';

// Convenience imports (for commonly used types)
import type { AuthUser, AuthState } from '@/types';

// Domain-specific imports
import type {
  LoginCredentials,
  AuthResult,
} from '@/interfaces/auth/auth.interfaces';
```

### 3. **Naming Conventions**

- **Types**: Use descriptive names ending in the type category
  - `AuthState`, `UserRole`, `HttpMethod`
- **Interfaces**: Use descriptive names ending in purpose
  - `AuthUser`, `LoginCredentials`, `ProfileFormProps`
- **Props interfaces**: Always end with `Props`
  - `AvatarEditorProps`, `ContactFormProps`
- **Result interfaces**: End with `Result`
  - `ProfileUpdateResult`, `ValidationResult`

### 4. **File Organization**

```typescript
// Each domain gets both a types and interfaces file
/types/auth.types.ts          // AuthState, AuthMethod, etc.
/interfaces/auth/auth.interfaces.ts  // AuthUser, LoginCredentials, etc.

// Related files are grouped together
/interfaces/components/       // All component prop interfaces
/interfaces/forms/           // All form prop interfaces
/interfaces/actions/         // All server action result interfaces
```

## Benefits of This Architecture

### 1. **Clarity and Intent**

- Clear distinction between data shapes (interfaces) and type unions/aliases (types)
- Easier to understand what each import provides
- Better IDE support and autocomplete

### 2. **Maintainability**

- Related types and interfaces are co-located by domain
- Easier to find and update related definitions
- Consistent naming and organization patterns

### 3. **Reusability**

- Common interfaces can be easily shared across components
- Type aliases provide flexibility for union types
- Clear contracts for API responses and server actions

### 4. **Type Safety**

- Comprehensive coverage of all application domains
- Consistent error handling patterns
- Strong typing for server actions and API responses

### 5. **Developer Experience**

- Excellent IntelliSense and autocomplete
- Clear error messages with proper type information
- Easy refactoring with TypeScript language server

## Tools and Utilities

The type system includes several utility functions and type guards:

```typescript
// Type guards for error handling
import { isAuthError, isValidationError } from '@/types/error.types';

// Action result helpers
import {
  createSuccessResult,
  createErrorResult,
  isActionSuccess,
} from '@/types/actions.types';

// Error factory functions
import { ErrorFactory } from '@/types/error.types';
```

## Future Enhancements

1. **Runtime Validation**: Integration with zod for runtime type checking
2. **Code Generation**: Generate OpenAPI schemas from TypeScript interfaces
3. **Documentation**: Auto-generate API documentation from interface definitions
4. **Testing**: Type-safe test utilities and mock generators
5. **Monitoring**: Type-safe logging and error reporting

This reorganized type system provides a solid foundation for scalable, maintainable, and type-safe development across the entire Cognito Profile Manager application.
