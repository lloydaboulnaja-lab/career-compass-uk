/** Minimal markdown -> HTML for the CV subset we generate (#, ##, -, **bold**). */
export function cvMarkdownToHtml(md: string): string {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;

  const inline = (text: string) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");

  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      closeList();
      continue;
    }
    if (trimmed.startsWith("### ")) {
      closeList();
      out.push(`<h3>${inline(trimmed.slice(4))}</h3>`);
    } else if (trimmed.startsWith("## ")) {
      closeList();
      out.push(`<h2>${inline(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith("# ")) {
      closeList();
      out.push(`<h1>${inline(trimmed.slice(2))}</h1>`);
    } else if (/^[-*]\s+/.test(trimmed)) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inline(trimmed.replace(/^[-*]\s+/, ""))}</li>`);
    } else {
      closeList();
      out.push(`<p>${inline(trimmed)}</p>`);
    }
  }
  closeList();
  return out.join("\n");
}

const DOC_CSS = `
body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #111; line-height: 1.35; }
h1 { font-size: 20pt; margin: 0 0 4pt; }
h2 { font-size: 12pt; margin: 14pt 0 4pt; border-bottom: 1px solid #999; padding-bottom: 2pt; text-transform: uppercase; letter-spacing: 0.5pt; }
h3 { font-size: 11pt; margin: 10pt 0 2pt; }
p { margin: 0 0 6pt; }
ul { margin: 0 0 8pt 16pt; padding: 0; }
li { margin-bottom: 3pt; }
`;

/** Download the tailored CV as a Word-openable document. */
export function downloadCvDoc(markdown: string, filename: string) {
  const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${filename}</title><style>${DOC_CSS}</style></head><body>${cvMarkdownToHtml(markdown)}</body></html>`;
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}
