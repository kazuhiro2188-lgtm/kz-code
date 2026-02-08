# Project Structure

## Organization Philosophy

Next.js App Router のファイルシステムベースルーティングに従う構成。
`app/` ディレクトリを中心に、ルートベースのコロケーション（関連ファイルを近くに配置）パターンを採用。

## Directory Patterns

### App Directory (`app/`)
**Location**: `/app/`  
**Purpose**: ページ・レイアウト・ルート定義（App Router 規約ファイル）  
**Pattern**: Next.js 規約ファイル（`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`）をルートごとに配置

### Routing Pattern
**Convention**: ディレクトリ = URL パス  
**Auth routes**: `/login`, `/signup`, `/reset-password`（未認証ユーザー向け）  
**Protected routes**: `/dashboard`, `/onboarding`（認証済みユーザー向け）  
**Root `/`**: `/dashboard` へリダイレクト

### Middleware (`middleware.ts`)
**Location**: プロジェクトルート  
**Purpose**: 認証ガード（Supabase Auth + SSR）  
**Pattern**: 未認証→ `/login` リダイレクト、認証済み + 認証ページ→ `/dashboard` リダイレクト

### CI/CD (`.github/workflows/`)
**Location**: `/.github/workflows/`  
**Purpose**: GitHub Actions パイプライン  
**Files**: `ci.yml`（lint + type-check + build）, `e2e.yml`（Playwright E2E テスト）

### E2E Tests (`e2e/`)
**Location**: `/e2e/`  
**Purpose**: Playwright E2E テスト  
**Pattern**: テストファイルをこのディレクトリに配置

### Specifications (`.kiro/specs/`)
**Location**: `/.kiro/specs/`  
**Purpose**: 機能ごとの仕様書（Spec-Driven Development）

### Steering (`.kiro/steering/`)
**Location**: `/.kiro/steering/`  
**Purpose**: プロジェクト全体のコンテキスト・ルール

## Naming Conventions

- **Files（ページ系）**: Next.js 規約に従う（`page.tsx`, `layout.tsx` 等）
- **Components**: PascalCase（例: `DashboardHeader.tsx`）
- **Utilities / Hooks**: camelCase（例: `useAuth.ts`, `formatDate.ts`）
- **CSS**: Tailwind CSS ユーティリティクラスを直接使用（CSS Modules は不使用）
- **Directories**: kebab-case（例: `reset-password/`）

## Import Organization

```typescript
// 1. External libraries
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

// 2. Internal absolute imports (path alias)
import { SomeComponent } from "@/components/SomeComponent";

// 3. Relative imports
import { localHelper } from "./utils";
```

**Path Aliases**:
- `@/`: プロジェクトルートにマッピング（`tsconfig.json` で設定）

## Code Organization Principles

- **Server-first**: デフォルトは Server Component。`"use client"` は必要最小限に
- **Colocation**: ルートに関連するファイルは同じディレクトリに配置
- **Convention over configuration**: Next.js の規約ファイル名を遵守
- **Auth boundary**: `middleware.ts` で認証境界を一元管理、各ページでの重複チェック不要

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
