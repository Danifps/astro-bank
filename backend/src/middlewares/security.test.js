import assert from 'node:assert/strict';
import test from 'node:test';
import {
  requireTrustedOrigin,
  setSessionCookie
} from './security.js';

test('requires an exact allowlisted origin for state-changing requests', () => {
  const previousOrigins = process.env.ALLOWED_ORIGINS;
  process.env.ALLOWED_ORIGINS = 'https://app.example.test,https://admin.example.test';

  try {
    const invoke = (origin) => {
      let nextCalled = false;
      let responseStatus = null;
      const req = { get: () => origin };
      const res = {
        status(status) {
          responseStatus = status;
          return this;
        },
        json() {
          return this;
        }
      };

      requireTrustedOrigin(req, res, () => {
        nextCalled = true;
      });

      return { nextCalled, responseStatus };
    };

    assert.deepEqual(invoke('https://app.example.test'), {
      nextCalled: true,
      responseStatus: null
    });
    assert.deepEqual(invoke(undefined), {
      nextCalled: false,
      responseStatus: 403
    });
    assert.deepEqual(invoke('https://attacker.example.test'), {
      nextCalled: false,
      responseStatus: 403
    });
  } finally {
    if (previousOrigins === undefined) {
      delete process.env.ALLOWED_ORIGINS;
    } else {
      process.env.ALLOWED_ORIGINS = previousOrigins;
    }
  }
});

test('sets the authentication cookie HttpOnly, SameSite strict and Secure in production', () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  let cookieOptions;

  try {
    setSessionCookie({
      cookie(_name, _token, options) {
        cookieOptions = options;
      }
    }, 'signed-session');
  } finally {
    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }
  }

  assert.equal(cookieOptions.httpOnly, true);
  assert.equal(cookieOptions.secure, true);
  assert.equal(cookieOptions.sameSite, 'strict');
  assert.equal(cookieOptions.path, '/api');
});
