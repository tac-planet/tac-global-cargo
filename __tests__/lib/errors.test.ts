import {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  mapSupabaseError,
  shouldRetry,
  getRetryDelay,
} from "@/lib/errors";

describe("Error classes", () => {
  it("AppError has correct properties", () => {
    const err = new AppError("test", "TEST_CODE", 400, { detail: "x" });
    expect(err.message).toBe("test");
    expect(err.code).toBe("TEST_CODE");
    expect(err.statusCode).toBe(400);
    expect(err.details).toEqual({ detail: "x" });
    expect(err.name).toBe("AppError");
  });

  it("ValidationError defaults to 400", () => {
    const err = new ValidationError("bad input");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
  });

  it("NotFoundError formats entity name", () => {
    const err = new NotFoundError("Shipment");
    expect(err.message).toBe("Shipment not found");
    expect(err.statusCode).toBe(404);
  });

  it("ConflictError is 409", () => {
    const err = new ConflictError("duplicate");
    expect(err.statusCode).toBe(409);
  });

  it("AuthenticationError defaults message", () => {
    const err = new AuthenticationError();
    expect(err.message).toBe("Not authenticated");
    expect(err.statusCode).toBe(401);
  });

  it("AuthorizationError defaults message", () => {
    const err = new AuthorizationError();
    expect(err.message).toBe("Not authorized");
    expect(err.statusCode).toBe(403);
  });

  it("NetworkError is code 0", () => {
    const err = new NetworkError();
    expect(err.statusCode).toBe(0);
    expect(err.code).toBe("NETWORK_ERROR");
  });
});

describe("mapSupabaseError", () => {
  it("maps 23505 to ConflictError", () => {
    const err = mapSupabaseError({ code: "23505" });
    expect(err).toBeInstanceOf(ConflictError);
  });

  it("maps 42501 to AuthorizationError", () => {
    const err = mapSupabaseError({ code: "42501" });
    expect(err).toBeInstanceOf(AuthorizationError);
  });

  it("maps JWT message to AuthenticationError", () => {
    const err = mapSupabaseError({ message: "JWT expired" });
    expect(err).toBeInstanceOf(AuthenticationError);
  });

  it("returns generic AppError for unknown", () => {
    const err = mapSupabaseError({ message: "something" });
    expect(err).toBeInstanceOf(AppError);
  });
});

describe("shouldRetry", () => {
  it("returns false for auth errors", () => {
    expect(shouldRetry(new AuthenticationError())).toBe(false);
    expect(shouldRetry(new AuthorizationError())).toBe(false);
  });

  it("returns false for validation and conflict", () => {
    expect(shouldRetry(new ValidationError("x"))).toBe(false);
    expect(shouldRetry(new ConflictError("x"))).toBe(false);
  });

  it("returns true for network errors", () => {
    expect(shouldRetry(new NetworkError())).toBe(true);
  });

  it("returns true for generic errors", () => {
    expect(shouldRetry(new Error("boom"))).toBe(true);
  });
});

describe("getRetryDelay", () => {
  it("uses exponential backoff", () => {
    expect(getRetryDelay(0)).toBe(1000);
    expect(getRetryDelay(1)).toBe(2000);
    expect(getRetryDelay(2)).toBe(4000);
  });

  it("caps at 16000ms", () => {
    expect(getRetryDelay(10)).toBe(16000);
  });
});
