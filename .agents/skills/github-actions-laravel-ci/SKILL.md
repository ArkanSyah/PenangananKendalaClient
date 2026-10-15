---
name: github-actions-laravel-ci
description: >-
  Use this skill when configuring, troubleshooting, or updating the Continuous Integration (CI)
  workflow in .github/workflows/ci.yml for the Laravel 11 and React Vite monorepo.
---

# GitHub Actions CI for Laravel & React

## Overview
This skill outlines the structure and operation of the Continuous Integration pipeline defined in `.github/workflows/ci.yml`. The pipeline automatically validates both the backend and frontend on every push and pull request to `main` and `unitTesting`.

---

## 1. Pipeline Architecture

The workflow consists of two parallel jobs:

### Job A: `backend-ci` (Ubuntu Latest)
1. **PHP Setup**: PHP 8.2 with extensions (`mbstring`, `xml`, `sqlite3`, `pdo_sqlite`, `curl`).
2. **Dependency Cache & Install**: `composer install --prefer-dist --no-interaction`.
3. **Environment Configuration**: Copies `.env.example`, generates application key.
4. **Database Migration**: Executes `php artisan migrate --force` using SQLite in-memory / file.
5. **Test Execution**: Runs `php artisan test` (must pass 100%).

### Job B: `frontend-ci` (Ubuntu Latest)
1. **Node Setup**: Node.js 20.x with npm cache.
2. **Dependencies**: `npm ci` (or `npm install`).
3. **Unit Tests**: `npm test -- --run` via Vitest (using `happy-dom` environment).
4. **Linting**: `npm run lint` (0 errors).
5. **Production Build**: `npm run build` (validates Vite & PWA Service Worker generation).

---

## 2. Troubleshooting Common CI Failures
- **SQLite Syntax Error in CI**: If a test passes on local MySQL but fails in CI, check for raw MySQL-specific statements (like `ALTER TABLE ... MODIFY`). Guard them with `if (DB::getDriverName() !== 'sqlite')`.
- **Node 20 jsdom incompatibility**: Use `happy-dom` in `vite.config.js` to prevent `webidl.util.markAsUncloneable` errors.
- **Missing Token or Permissions**: GitHub Actions uses the built-in `GITHUB_TOKEN`. For pushing from external agents, a Personal Access Token (PAT) with `repo` and `workflow` scopes is required.

---

## 3. Local Pre-Push Verification Checklist
Before pushing any commit to remote, run this full verification script locally:

```bash
# 1. Test Backend
cd webPenangananKendalaClientBE && php artisan test

# 2. Test Frontend
cd ../webPenangananKendalaClientFE
npm test -- --run
npm run lint
npm run build
```
If and only if all 3 commands exit with code 0, proceed with `git push origin <branch>`.
