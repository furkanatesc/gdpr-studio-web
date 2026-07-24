/*
  Hafif, bağımlılıksız markdown → HTML dönüştürücü (Electron prototipinden taşındı).
  Tablo, sıralı/sırasız liste, başlık, alıntı, yatay çizgi, kalın/italik/kod;
  model çıktısı HTML-kaçışlanır (XSS koruması).
*/

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(s: string): string {
  s = esc(s);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, "$1<em>$2</em>");
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  return s;
}

export function renderMarkdown(text: string): string {
  const lines = String(text).replace(/\r\n/g, "\n").split("\n");
  const isSep = (l: string) =>
    /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(l);
  const isHr = (l: string) => /^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(l);
  const parseRow = (l: string) =>
    l.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim());

  let html = "";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }
    if (isHr(line)) {
      html += "<hr>";
      i++;
      continue;
    }

    const h = line.match(/^\s*(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (h) {
      const lvl = Math.min(h[1].length, 4);
      html += `<h${lvl}>${inline(h[2])}</h${lvl}>`;
      i++;
      continue;
    }

    if (line.includes("|") && i + 1 < lines.length && isSep(lines[i + 1])) {
      const headers = parseRow(line);
      i += 2;
      let body = "";
      while (
        i < lines.length &&
        lines[i].includes("|") &&
        !/^\s*$/.test(lines[i]) &&
        !isSep(lines[i])
      ) {
        const cells = parseRow(lines[i]);
        body += "<tr>" + cells.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>";
        i++;
      }
      html +=
        '<div class="table-wrap"><table><thead><tr>' +
        headers.map((c) => `<th>${inline(c)}</th>`).join("") +
        "</tr></thead><tbody>" +
        body +
        "</tbody></table></div>";
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      html += `<blockquote>${inline(buf.join(" "))}</blockquote>`;
      continue;
    }

    if (/^\s*[-*•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*•]\s+/, ""));
        i++;
      }
      html += "<ul>" + items.map((it) => `<li>${inline(it.trim())}</li>`).join("") + "</ul>";
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ""));
        i++;
      }
      html += "<ol>" + items.map((it) => `<li>${inline(it.trim())}</li>`).join("") + "</ol>";
      continue;
    }

    // Yukaridaki blok kontrollerinin hicbiri eslesmedi: bu satir her kosulda
    // tuketilir. Akis sirasinda olusan yarim satirlarda ("## " gibi; baslik
    // regexi metin ister, paragraf dislamasi istemez) dongunun ilerlemesini
    // garanti eder — aksi halde sekme donar.
    const para: string[] = [lines[i]];
    i++;
    while (
      i < lines.length &&
      !/^\s*$/.test(lines[i]) &&
      !isHr(lines[i]) &&
      !/^\s*#{1,6}\s+/.test(lines[i]) &&
      !/^\s*[-*•]\s+/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !(lines[i].includes("|") && i + 1 < lines.length && isSep(lines[i + 1]))
    ) {
      para.push(lines[i]);
      i++;
    }
    html += `<p>${inline(para.join(" "))}</p>`;
  }
  return html;
}
