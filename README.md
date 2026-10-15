# Internal Ops & Developer Tools Hub

## 📖 Overview

This project is a centralized internal web application designed to manage development resources, infrastructure commands, environment configurations, and testing data. It serves as a unified workspace for engineers to streamline daily operations, minimize context switching, and standardize configurations across various environments.

## 🛠 Tech Stack

- **Core Framework:** Next.js (App Router) with React and TypeScript.
- **Styling & UI Components:** Tailwind CSS paired with Shadcn UI. This combination provides professional, highly customizable components (e.g., Sidebar, Command Palette, Dialog, Toast) without the bloat of heavy component libraries.
- **Database (BaaS):** Supabase (PostgreSQL). Used for direct CRUD operations from the client/server components, eliminating the need for a separate backend API layer.
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`).
  - Integrated with Next.js App Router using a dedicated Client Component wrapper (`StoreProvider.tsx`).
  - Manages cross-page global states centrally, such as the currently active target environment (`activeEnv`), ensuring consistency when navigating between the Token Manager and Commands pages.
  - Architected with feature slices to easily accommodate future state complexity as the internal toolset scales.
- **Syntax Highlighting:** `react-syntax-highlighter` for rendering formatted YAML, JSON, and Bash scripts with proper syntax colors.

## 📐 UI Layout & Architecture

The application follows a standard documentation/dashboard layout optimized for technical tools:

- **Left Sidebar:** A collapsible navigation menu dividing tools into logical categories (e.g., Authentication, Scripts, AI Testing, DevOps).
- **Top Header:** Features a minimal design focused on a **Global Search Command Palette (accessible via `Ctrl + K`)**. This allows users to instantly search for any command, JWT, or configuration across the entire app.
- **Main Content Area:** A clean, wide-screen optimized workspace designed to display long strings, code blocks, and data grids without visual clutter.

## 🗂 Application Structure & Routing

### 1. `/jwt-manager` (Token Management)

- **Purpose:** Manage JWT tokens across multiple environments.
- **Features:**
  - Displays a list of environments fetched from the database.
  - Inline editing: Each row contains `[Environment Name] | [JWT Input] | [Copy] | [Edit]`.
  - Toggling `Edit` switches the action buttons to `[Cancel]` and `[Save]` to update the token in Supabase.

### 2. `/commands` (Dynamic Scripts & Snippets)

- **Purpose:** Store and generate contextual CLI commands (Kubernetes, AWS, Git, etc.).
- **Features:**
  - A global input field at the top to define the `Target Environment` (e.g., `elephantdev1`).
  - Commands are stored as templates (e.g., `kubectl --kubeconfig {{ENV_NAME}} get pod -A`).
  - The UI dynamically injects the target environment into all visible templates, ready to be copied with a single click.

### 3. `/ai-test-data` (AI Dataset Management)

- **Purpose:** Store structured JSON payloads for AI testing and prompt evaluations.
- **Features:**
  - Displays data in a **Card Grid** layout showing the Title and a truncated Description.
  - `Copy JSON` button compiles the structured data (Conclusion, Work Notes, etc.) into a valid JSON string to the clipboard.
  - `Edit` button opens a Modal/Dialog containing a Textarea for raw JSON manipulation.

### 4. `/devops-configs` (Infrastructure Documentation)

- **Purpose:** Centralized repository for service access details and YAML configurations (RabbitMQ, Hasura, LiteLLM, Istio VirtualServices).
- **Features:**
  - Markdown-based documentation viewer.
  - Syntax-highlighted code blocks with dedicated one-click copy buttons.

### 5. `/settings/environments` (Global Configuration)

- **Purpose:** The single source of truth for all environment variables used in the app.
- **Features:**
  - Simple CRUD interface for environment names (e.g., `elephantdev1`, `elephantqc1`).
  - Data managed here populates the dropdowns and lists in `/jwt-manager` and `/commands`.

## 🚀 Future Enhancements & Extensibility

The architecture is designed to be highly modular. Future extensions may include:

- **Direct API Integrations:** Executing simple Kubernetes or AWS commands directly from the browser using a lightweight Node.js/Go backend layer.
- **Log Viewer:** A dedicated page to aggregate and tail logs from different namespaces.
- **Code Formatters & Converters:** Built-in utilities for JSON formatting, Base64 encoding/decoding, and JWT decoding.
- **Role-Based Access Control (RBAC):** Implementing Supabase Auth to restrict sensitive environment configurations to specific team members.
