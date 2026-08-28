import React from "react";

// A small, dependency-free markdown renderer covering what AI+ responses
// actually use: bold, inline code, fenced code blocks, bullet/numbered
// lists, and simple tables. Not a full CommonMark parser — deliberately
// scoped to keep the bundle light.

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  // biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop
  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(
        <strong key={`${keyPrefix}-b-${i++}`} className="font-bold">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      parts.push(
        <code
          key={`${keyPrefix}-c-${i++}`}
          className="px-1 py-0.5 rounded bg-black/20 font-mono text-[0.9em]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

export function MarkdownLite({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trim().startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push(
        <pre
          key={`code-${key++}`}
          className="bg-black/30 rounded-lg p-3 overflow-x-auto text-xs font-mono my-2"
        >
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    // Table (simple: header row, separator row, data rows)
    if (line.includes("|") && lines[i + 1]?.match(/^[\s|:-]+$/)) {
      const headerCells = line.split("|").map((c) => c.trim()).filter(Boolean);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(lines[i].split("|").map((c) => c.trim()).filter(Boolean));
        i++;
      }
      blocks.push(
        <div key={`table-${key++}`} className="overflow-x-auto my-2">
          <table className="text-xs border-collapse w-full">
            <thead>
              <tr>
                {headerCells.map((h, idx) => (
                  <th
                    key={idx}
                    className="border border-white/15 px-2 py-1 text-left font-semibold"
                  >
                    {renderInline(h, `th-${idx}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, rIdx) => (
                <tr key={rIdx}>
                  {r.map((c, cIdx) => (
                    <td key={cIdx} className="border border-white/15 px-2 py-1">
                      {renderInline(c, `td-${rIdx}-${cIdx}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Bullet / numbered list run
    if (/^\s*([-*]|\d+\.)\s/.test(line)) {
      const items: string[] = [];
      const ordered = /^\s*\d+\./.test(line);
      while (i < lines.length && /^\s*([-*]|\d+\.)\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s/, ""));
        i++;
      }
      const ListTag = ordered ? "ol" : "ul";
      blocks.push(
        <ListTag
          key={`list-${key++}`}
          className={`my-1.5 pl-5 space-y-0.5 ${ordered ? "list-decimal" : "list-disc"}`}
        >
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, `li-${idx}`)}</li>
          ))}
        </ListTag>,
      );
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    blocks.push(
      <p key={`p-${key++}`} className="my-1 leading-relaxed">
        {renderInline(line, `p-${key}`)}
      </p>,
    );
    i++;
  }

  return <div className="text-sm">{blocks}</div>;
}
