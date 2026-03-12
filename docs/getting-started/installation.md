# Installation

Docxa is currently available as a developer tool. You can run it seamlessly using `npx` or install it globally.

## Prerequisites

- **Node.js**: Version 22 or higher.
- **npm**: Version 8 or higher.
- **Ax-LLM**: Docxa relies on Ax-LLM for its intelligence layer.

## Setup & Execution

### Option 1: Using npx (Recommended)

The easiest way to use Docxa is via `npx`. This ensures you always have the latest version without manual installation.

```bash
# Initialize a new Docxa workspace
npx @thelogicatelier/docxa init

# Analyze a repository
npx @thelogicatelier/docxa discover .
```

### Option 2: Global Installation

If you prefer to have the `docxa` command available globally:

```bash
npm install -g @thelogicatelier/docxa

# Now you can run it directly:
docxa init
docxa discover .
```

### Option 3: From Source (For Contributors)

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/achatt89/doxa.git
    cd doxa
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Build the Project**:
    ```bash
    npm run build
    ```

4.  **Link for Development**:
    ```bash
    npm link
    ```

## Verifying Installation

Run the following command to check if Docxa is correctly installed:

```bash
npx @thelogicatelier/docxa --version
```
