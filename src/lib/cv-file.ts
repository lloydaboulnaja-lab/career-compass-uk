export async function readCvFile(file: File): Promise<string> {
  if (file.size > 5_000_000) throw new Error('Choose a CV smaller than 5 MB.');
  let text: string;
  if (/\.pdf$/i.test(file.name)) {
    const pdfjs = await import('pdfjs-dist');
    const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    try {
      const pages: string[] = [];
      for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        pages.push(content.items.map(item => 'str' in item ? item.str + (item.hasEOL ? '\n' : ' ') : '').join(''));
      }
      text = pages.join('\n');
    } finally { await pdf.destroy(); }
  } else if (/\.docx$/i.test(file.name)) {
    const mammoth = await import('mammoth');
    text = (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
  } else if (/\.(txt|md|markdown)$/i.test(file.name)) {
    text = await file.text();
  } else {
    throw new Error('Choose PDF, DOCX, TXT or Markdown, or paste your CV instead.');
  }
  if (text.includes('\u0000') || text.trim().length < 50) throw new Error('No readable CV text found. For a scanned PDF, copy or type your CV instead.');
  if (text.length > 20000) throw new Error('This CV is too long. Paste up to 20,000 characters instead.');
  return text.trim();
}