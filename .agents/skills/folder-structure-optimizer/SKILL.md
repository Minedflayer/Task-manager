# Skill: Project Structure Optimizer

---
name: folder-structure-optimizer
description: Guides agents through restructuring and optimizing project directories. Use when organizing workspace folders or cleaning up repository layouts.
---

## Objective
Analyze the current working directory, identify the project's primary technical stack, and reorganize the file system into a clean, scalable, and idiomatic folder structure.

## Triggers
Activate this skill when the user requests to:
- "Clean up my folder structure."
- "Organize this project."
- "Refactor the file tree."
- "Set up the initial project boilerplate."

## Operational Rules & Guardrails
1. **Never Delete Unrecognized Files:** If a file's purpose is unclear, move it to a `legacy/` or `unorganized/` folder rather than deleting it.
2. **Preserve Configuration:** Do not move root-level configuration files (e.g., `pom.xml`, `package.json`, `requirements.txt`, `Dockerfile`, `.gitignore`) unless explicitly instructed.
3. **Draft Before Execution:** ALWAYS output a tree diagram of the proposed structure for the user to approve BEFORE executing any `mv` or `mkdir` commands.
4. **Update Imports:** When moving source files, you must also update the relative and absolute import paths in the affected files to prevent compilation or runtime errors.

## Execution Steps

### Step 1: Analyze the Environment
Run tree or list directory commands to assess the current state. Identify the core technologies in use (e.g., React, Spring Boot, Python, Streamlit).

### Step 2: Determine the Target Architecture
Apply the appropriate structural blueprint based on the detected stack:

**Blueprint A: Java / Spring Boot (Domain-Driven)**
- Group by feature/domain rather than technical layer.
- `src/main/java/com/app/{domain}/` (containing controllers, services, repositories for that specific domain).
- `src/test/` mirroring the main structure.

**Blueprint B: React / Web Frontend**
- `src/components/` (Reusable, dumb UI components)
- `src/pages/` or `src/features/` (Stateful, routable views)
- `src/hooks/` (Custom React hooks)
- `src/services/` or `src/api/` (API client and calls)
- `src/assets/` (Static files, CSS, images)

**Blueprint C: Python / CLI & AI Tools**
- `core/` (Core logic and initialization)
- `utils/` (Helper functions)
- `prompts/` (If applicable, store LLM prompts as separate `.md` or `.txt` files)
- `tests/` (Pytest suite)

### Step 3: Propose & Confirm
Output the proposed structure using a markdown tree block. 
*Ask the user: "Does this structure align with your vision, and may I proceed with moving the files?"*

### Step 4: Execute & Refactor
Upon approval, create the necessary directories, move the files, and execute a workspace-wide search and replace to fix broken import paths.