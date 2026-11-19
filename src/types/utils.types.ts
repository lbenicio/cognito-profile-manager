/**
 * Utility types for common patterns used throughout the application.
 */

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Make specific keys optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific keys required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

/**
 * Extract keys of a specific type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Exclude keys of a specific type
 */
export type ExcludeKeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? never : K;
}[keyof T];

/**
 * Create a type with only specific value types
 */
export type PickByType<T, U> = Pick<T, KeysOfType<T, U>>;

/**
 * Create a type excluding specific value types
 */
export type OmitByType<T, U> = Omit<T, KeysOfType<T, U>>;

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Optional type
 */
export type Optional<T> = T | undefined;

/**
 * Maybe type (nullable and optional)
 */
export type Maybe<T> = T | null | undefined;

/**
 * Non-nullable type
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Array element type
 */
export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

/**
 * Promise resolve type
 */
export type PromiseResolveType<T> = T extends Promise<infer U> ? U : T;

/**
 * Function parameter types
 */
export type Parameters<T extends (...args: never[]) => unknown> = T extends (
  ...args: infer P
) => unknown
  ? P
  : never;

/**
 * Function return type
 */
export type ReturnType<T extends (...args: never[]) => unknown> = T extends (
  ...args: never[]
) => infer R
  ? R
  : never;

/**
 * Async function return type
 */
export type AsyncReturnType<T extends (...args: never[]) => Promise<unknown>> =
  T extends (...args: never[]) => Promise<infer R> ? R : never;

/**
 * Object values type
 */
export type ValueOf<T> = T[keyof T];

/**
 * Object entries type
 */
export type Entries<T> = Array<[keyof T, ValueOf<T>]>;

/**
 * String literal union to array
 */
export type StringLiteralArray<T extends string> = T[];

/**
 * Extract string literal union
 */
export type StringLiteral<T> = T extends string
  ? string extends T
    ? never
    : T
  : never;

/**
 * Tuple to union
 */
export type TupleToUnion<T extends readonly unknown[]> = T[number];

/**
 * Union to intersection
 */
export type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

/**
 * Mutable type (removes readonly)
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Immutable type (adds readonly)
 */
export type Immutable<T> = {
  readonly [P in keyof T]: T[P];
};

/**
 * Deep readonly type
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Deep mutable type
 */
export type DeepMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P];
};

/**
 * Branded type for type safety
 */
export type Brand<T, B> = T & { readonly __brand: B };

/**
 * Opaque type
 */
export type Opaque<T, K extends PropertyKey> = T & { readonly [P in K]: T };

/**
 * JSON serializable types
 */
export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = { [Key in string]?: JsonValue };
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

/**
 * JsonSerializable type (can be JSON stringified)
 */
export type JsonSerializable<T> = T extends JsonValue ? T : never;

/**
 * Constructor type
 */
export type Constructor<T = object> = new (...args: never[]) => T;

/**
 * Abstract constructor type
 */
export type AbstractConstructor<T = object> = abstract new (
  ...args: never[]
) => T;

/**
 * Class type
 */
export type Class<T = {}> = Constructor<T>;

/**
 * Mixin type
 */
export type Mixin<T extends Constructor> = T & Constructor;

/**
 * Event handler type
 */
export type EventHandler<T = Event> = (event: T) => void;

/**
 * Async event handler type
 */
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

/**
 * Callback type
 */
export type Callback<T = void> = () => T;

/**
 * Async callback type
 */
export type AsyncCallback<T = void> = () => Promise<T>;

/**
 * Predicate function type
 */
export type Predicate<T> = (value: T) => boolean;

/**
 * Async predicate function type
 */
export type AsyncPredicate<T> = (value: T) => Promise<boolean>;

/**
 * Mapper function type
 */
export type Mapper<T, U> = (value: T) => U;

/**
 * Async mapper function type
 */
export type AsyncMapper<T, U> = (value: T) => Promise<U>;

/**
 * Reducer function type
 */
export type Reducer<T, U> = (
  accumulator: U,
  current: T,
  index: number,
  array: T[]
) => U;

/**
 * Comparator function type
 */
export type Comparator<T> = (a: T, b: T) => number;

/**
 * Validator function type
 */
export type Validator<T> = (value: T) => boolean | string | string[];

/**
 * Async validator function type
 */
export type AsyncValidator<T> = (
  value: T
) => Promise<boolean | string | string[]>;

/**
 * Transform function type
 */
export type Transform<T, U> = (input: T) => U;

/**
 * Async transform function type
 */
export type AsyncTransform<T, U> = (input: T) => Promise<U>;

/**
 * Factory function type
 */
export type Factory<T> = (...args: never[]) => T;

/**
 * Async factory function type
 */
export type AsyncFactory<T> = (...args: never[]) => Promise<T>;

/**
 * Disposable interface
 */
export interface Disposable {
  dispose(): void;
}

/**
 * Async disposable interface
 */
export interface AsyncDisposable {
  dispose(): Promise<void>;
}

/**
 * Comparable interface
 */
export interface Comparable<T> {
  compareTo(other: T): number;
}

/**
 * Equatable interface
 */
export interface Equatable<T> {
  equals(other: T): boolean;
}

/**
 * Hashable interface
 */
export interface Hashable {
  hashCode(): number;
}

/**
 * Cloneable interface
 */
export interface Cloneable<T> {
  clone(): T;
}

/**
 * SerializableInterface interface
 */
export interface SerializableInterface<T> {
  serialize(): string;
  deserialize(data: string): T;
}

/**
 * Observer pattern interfaces
 */
export interface Observer<T> {
  update(data: T): void;
}

export interface Subject<T> {
  attach(observer: Observer<T>): void;
  detach(observer: Observer<T>): void;
  notify(data: T): void;
}

/**
 * Result type for error handling
 */
export type Result<T, E = Error> =
  { success: true; data: T } | { success: false; error: E };

/**
 * Option type for nullable values
 */
export type Option<T> = { some: true; value: T } | { some: false; value: null };

/**
 * Either type for union handling
 */
export type Either<L, R> = { left: true; value: L } | { right: true; value: R };

/**
 * Try type for exception handling
 */
export type Try<T> =
  { success: true; value: T } | { success: false; error: Error };

/**
 * Lazy type for deferred evaluation
 */
export type Lazy<T> = () => T;

/**
 * Thunk type for deferred computation
 */
export type Thunk<T> = () => T;

/**
 * Lens type for functional updates
 */
export interface Lens<S, A> {
  get: (s: S) => A;
  set: (a: A) => (s: S) => S;
  modify: (f: (a: A) => A) => (s: S) => S;
}

/**
 * Path type for nested object access
 */
export type Path<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends object
    ? K | `${K}.${Path<T[K], keyof T[K]>}`
    : K
  : never;

/**
 * Get type by path
 */
export type PathValue<T, P extends Path<T>> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? Rest extends Path<T[K]>
        ? PathValue<T[K], Rest>
        : never
      : never
    : never;

/**
 * Flatten object type
 */
export type Flatten<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: O[K] }
    : never
  : T;

/**
 * Environment types
 */
export type Environment = 'development' | 'production' | 'test';

/**
 * HTTP methods
 */
export type HttpMethod =
  'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/**
 * HTTP status codes
 */
export type HttpStatusCode =
  | 200
  | 201
  | 202
  | 204
  | 400
  | 401
  | 403
  | 404
  | 409
  | 422
  | 429
  | 500
  | 502
  | 503
  | 504;

/**
 * MIME types
 */
export type MimeType =
  | 'application/json'
  | 'application/xml'
  | 'text/html'
  | 'text/plain'
  | 'text/csv'
  | 'image/jpeg'
  | 'image/png'
  | 'image/gif'
  | 'image/webp'
  | 'video/mp4'
  | 'audio/mpeg'
  | 'application/pdf'
  | 'application/octet-stream';

/**
 * CSS units
 */
export type CssUnit = 'px' | 'em' | 'rem' | '%' | 'vh' | 'vw' | 'vmin' | 'vmax';

/**
 * CSS value with unit
 */
export type CssValue = `${number}${CssUnit}`;

/**
 * Color formats
 */
export type HexColor = `#${string}`;
export type RgbColor = `rgb(${number}, ${number}, ${number})`;
export type RgbaColor = `rgba(${number}, ${number}, ${number}, ${number})`;
export type HslColor = `hsl(${number}, ${number}%, ${number}%)`;
export type HslaColor = `hsla(${number}, ${number}%, ${number}%, ${number})`;
export type Color =
  HexColor | RgbColor | RgbaColor | HslColor | HslaColor | string;

/**
 * Date string formats
 */
export type DateString = string; // ISO 8601 format
export type TimeString = string; // HH:MM:SS format
export type DateTimeString = string; // ISO 8601 datetime format

/**
 * ID types
 */
export type UUID = Brand<string, 'UUID'>;
export type UserId = Brand<string, 'UserId'>;
export type SessionId = Brand<string, 'SessionId'>;
export type RequestId = Brand<string, 'RequestId'>;

/**
 * URL types
 */
export type Url = Brand<string, 'URL'>;
export type Email = Brand<string, 'Email'>;
export type PhoneNumber = Brand<string, 'PhoneNumber'>;

/**
 * Pagination types
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Search types
 */
export interface SearchParams {
  query: string;
  filters?: Record<string, unknown>;
  pagination?: PaginationParams;
}

export interface SearchResult<T> extends PaginationResult<T> {
  query: string;
  filters?: Record<string, unknown>;
  totalResults: number;
  searchTime: number;
}
