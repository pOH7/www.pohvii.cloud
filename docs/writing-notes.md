# Writing Notes Guide

This guide explains the structure and conventions for writing notes in the content management system.

## Directory Structure

Notes are organized in the following structure:

```
content/note/
└── {lang}/
    └── {topic}/
        ├── overview.mdx
        ├── install.mdx
        ├── quickstart.mdx
        ├── config.mdx
        ├── usage.mdx
        ├── examples.mdx
        ├── troubleshooting.mdx
        └── install/
            ├── windows.mdx
            ├── macOS.mdx
            └── linux.mdx
```

- **`{lang}`**: Language code (e.g., `en`, `zh`)
- **`{topic}`**: Topic name (e.g., `hammerspoon`, `dnsmasq`)

## Standard Sections

Notes follow a standard section order:

1. **overview** - Introduction and overview of the topic
2. **install** - Installation instructions
3. **quickstart** - Quick start guide
4. **config** - Configuration details
5. **usage** - Usage instructions
6. **examples** - Examples and use cases
7. **troubleshooting** - Common issues and solutions

## Section Types

### Single-File Sections

Create a single `.mdx` file for simple sections:

```
content/note/en/hammerspoon/overview.mdx
```

### Multi-File Sections (with Subsections)

For platform-specific or multi-variant content, create a directory with multiple files:

```
content/note/en/dnsmasq/install/
├── windows.mdx
├── macOS.mdx
└── linux.mdx
```

Each subsection file represents a tab in the UI.

## Frontmatter

Add YAML frontmatter at the top of each `.mdx` file to control metadata:

```yaml
---
title: "Custom Title"
description: "Brief description of the content"
platform: "macOS"      # For subsections (e.g., 'Windows', 'Linux', 'macOS')
order: 1               # Custom ordering (lower numbers appear first)
icon: "terminal"       # Optional icon identifier
protected: true        # Require authentication to view (overview.mdx only)
---
```

### Frontmatter Fields

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `title` | string | Display title for the section/subsection | Optional |
| `description` | string | Brief description | Optional |
| `platform` | string | Platform identifier (for subsections) | Optional |
| `order` | number | Custom ordering within directory (default: 999) | Optional |
| `icon` | string | Icon identifier | Optional |
| `protected` | boolean | Require authentication (overview only) | Optional |

## Content Guidelines

### Title Extraction

- If no `title` is provided in frontmatter, the system extracts the first H1 heading (`# Title`)
- For subsections without a title, the filename is capitalized (e.g., `windows.mdx` → "Windows")

### Description Extraction

- The system automatically extracts the first text paragraph as the description
- Skips code blocks, headings, lists, and component tags
- Limited to 200 characters

### Heading Structure

```markdown
# Main Title (H1)

First paragraph becomes the description...

## Section Heading (H2)

### Subsection Heading (H3)
```

### Code Blocks

Use fenced code blocks with language specification:

````markdown
```bash
brew install hammerspoon
```

```lua
hs.hotkey.bind({"cmd", "alt", "ctrl"}, "W", function()
  hs.alert.show("Hello World!")
end)
```
````

#### Diff Highlighting

Use special markers at the start of lines for diff highlighting:

- `+` = added line (green)
- `-` = removed line (red)
- `~` or `!` = changed line (yellow)

````markdown
```javascript
  function example() {
-   const old = "removed";
+   const new = "added";
~   const modified = "changed";
  }
```
````

### Auto-linked Headings

All headings automatically get:
- Anchor links with IDs based on the heading text
- Hover icons for easy linking
- Slug generation (e.g., `## Installation Guide` → `#installation-guide`)

## Example Note Structure

### Example 1: Simple Topic

```
content/note/en/example-tool/
├── overview.mdx
├── install.mdx
└── usage.mdx
```

**overview.mdx:**
```markdown
---
title: "Example Tool"
description: "A powerful example tool for demonstrations"
---

# Example Tool

This is an overview of the example tool that helps you do amazing things.

## Features

- Feature 1
- Feature 2
- Feature 3
```

### Example 2: Platform-Specific Installation

```
content/note/en/dnsmasq/
├── overview.mdx
└── install/
    ├── windows.mdx
    ├── macOS.mdx
    └── linux.mdx
```

**install/macOS.mdx:**
```markdown
---
title: "Install on macOS"
platform: "macOS"
order: 2
---

# Installing dnsmasq on macOS

## Using Homebrew

```bash
brew install dnsmasq
```

## Configuration

Edit the configuration file...
```

**install/windows.mdx:**
```markdown
---
title: "Install on Windows"
platform: "Windows"
order: 1
---

# Installing dnsmasq on Windows

Download the installer from...
```

## Protected Notes

To require authentication for viewing a note, add `protected: true` to the **overview.mdx** frontmatter:

```yaml
---
title: "Private Configuration"
protected: true
---
```

This setting applies to the entire note (all sections).

## Reading Time

Reading time is automatically calculated based on all content across all sections and displayed in the note metadata.

## MDX Features

Your notes support full MDX syntax:

### Standard Markdown

- **Bold**, *italic*, ~~strikethrough~~
- Lists (ordered and unordered)
- Links: `[text](url)`
- Images: `![alt](url)`
- Blockquotes
- Tables

### GitHub Flavored Markdown (GFM)

- Task lists: `- [ ] Todo item`
- Strikethrough: `~~deleted~~`
- Tables with alignment
- Autolinked URLs

### Custom Components

Import and use React components in your MDX files:

```mdx
import { CustomComponent } from '@/components/custom'

# My Note

<CustomComponent prop="value" />

Regular markdown content...
```

## Best Practices

1. **Use descriptive filenames**: Use lowercase, hyphenated names (e.g., `getting-started.mdx`)
2. **Start with overview**: Always create an `overview.mdx` as the entry point
3. **One H1 per file**: Use only one H1 heading at the top of each file
4. **Consistent structure**: Follow the standard section order when applicable
5. **Platform specificity**: Use subsections for platform-specific instructions
6. **Code examples**: Include practical, working code examples
7. **Clear descriptions**: Write concise first paragraphs that clearly describe the content

## Troubleshooting

### Note not appearing

- Verify the directory structure: `content/note/{lang}/{topic}/`
- Ensure at least one section file exists
- Check that the file extension is `.mdx` or `.md`

### Sections out of order

- Use `order` in frontmatter to control ordering
- Lower numbers appear first (default: 999)

### Subsections not showing

- Verify the directory structure: `{topic}/{section}/{subsection}.mdx`
- Check that at least one `.mdx` file exists in the section directory
- Review frontmatter for typos

### Protected note not working

- Ensure `protected: true` is in **overview.mdx** frontmatter only
- Check authentication system is properly configured

## Technical Details

### Rendering Pipeline

1. MDX files are read from the file system
2. Frontmatter is parsed using `gray-matter`
3. Content is serialized with `next-mdx-remote`
4. Plugins applied:
   - `remark-gfm` - GitHub Flavored Markdown
   - `rehype-pretty-code` - Syntax highlighting
   - `rehype-slug` - Auto-generate heading IDs
   - `rehype-autolink-headings` - Add anchor links to headings
   - `rehype-numbered-headings` - Add heading numbers

### Syntax Highlighting

- Theme: GitHub Light (light mode) / GitHub Dark (dark mode)
- Auto-detects language from code fence
- Supports diff highlighting with `+`, `-`, `~`, `!` markers

### URL Structure

Notes are accessible at:

```
/{lang}/note/{topic}
```

Example: `/en/note/hammerspoon`

Section anchors:

```
/{lang}/note/{topic}#{section-key}
```

Example: `/en/note/hammerspoon#install`
