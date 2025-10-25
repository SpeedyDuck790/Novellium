# Generate PDF Documentation Script

This script converts the Markdown documentation files to PDF format for easy viewing and distribution.

## Files to Convert:
- README.md → README.pdf
- docs/USER-GUIDE.md → docs/USER-GUIDE.pdf  
- docs/GAME-FORMAT.md → docs/GAME-FORMAT.pdf

## Methods:

### Option 1: Using Pandoc (Recommended)
```bash
# Install pandoc
# Windows: choco install pandoc
# Mac: brew install pandoc
# Linux: apt-get install pandoc

# Generate PDFs
pandoc README.md -o docs/README.pdf --pdf-engine=wkhtmltopdf
pandoc docs/USER-GUIDE.md -o docs/USER-GUIDE.pdf --pdf-engine=wkhtmltopdf
pandoc docs/GAME-FORMAT.md -o docs/GAME-FORMAT.pdf --pdf-engine=wkhtmltopdf
```

### Option 2: Using Markdown to PDF Online
1. Copy markdown content
2. Paste into online converter (markdown-pdf.com, etc.)
3. Download and save to docs/ folder

### Option 3: Print to PDF from Browser
1. Open markdown files in browser with markdown viewer
2. Use browser Print → Save as PDF
3. Save to docs/ folder

## Current Status:
- ✅ USER-GUIDE.pdf (exists)
- ✅ GAME-FORMAT.pdf (exists)
- ⏳ README.pdf (needs generation)

Run this script after updating any documentation to keep PDFs current.