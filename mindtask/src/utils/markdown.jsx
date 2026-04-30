export function renderMarkdown(content) {
  if (!content) return null;
  return content.split("\n").map((line, i) => {
    const b = t => t.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    if (line.startsWith("# "))   return <h1 key={i}>{line.slice(2)}</h1>;
    if (line.startsWith("## "))  return <h2 key={i}>{line.slice(3)}</h2>;
    if (line.startsWith("### ")) return <h3 key={i}>{line.slice(4)}</h3>;
    if (line.startsWith("> "))   return <blockquote key={i} dangerouslySetInnerHTML={{__html: b(line.slice(2))}} />;
    if (line.startsWith("- "))   return <ul key={i}><li dangerouslySetInnerHTML={{__html: b(line.slice(2))}} /></ul>;
    if (/^\d+\. /.test(line))    return <ol key={i}><li dangerouslySetInnerHTML={{__html: b(line.replace(/^\d+\. /,""))}} /></ol>;
    if (line === "")             return <br key={i} />;
    return <p key={i} dangerouslySetInnerHTML={{__html: b(line)}} />;
  });
}

// ─── THEME CONTEXT ───────────────────────────────────────────────────────────
