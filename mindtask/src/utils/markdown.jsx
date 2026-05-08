/**

 * Supported syntax:
 * - Headings: # H1, ## H2, ### H3
 * - Blockquotes: > text
 * - Unordered lists: - item
 * - Ordered lists: 1. item, 2. item, etc.
 * - Bold text: **bold** (converted to <strong>)
 * - Paragraphs: regular text
 * - Line breaks: empty lines become <br />
  
 * @param {string} content - Markdown text content to render
 * @returns {JSX.Element[]|null} Array of JSX elements or null if content is empty
 * 
 * Example usage:
 * renderMarkdown("# Welcome\nThis is **bold** text\n- List item")
 */
export function renderMarkdown(content) {
  if (!content) return null;
  
  // Split content by newlines and map each line to a React element
  return content.split("\n").map((line, i) => {
    // Helper function: Converts **text** to <strong>text</strong> using regex
    const b = t => t.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    
    // Heading Level 1 (# Heading)
    if (line.startsWith("# "))   return <h1 key={i}>{line.slice(2)}</h1>;
    
    // Heading Level 2 (## Heading)
    if (line.startsWith("## "))  return <h2 key={i}>{line.slice(3)}</h2>;
    
    // Heading Level 3 (### Heading)
    if (line.startsWith("### ")) return <h3 key={i}>{line.slice(4)}</h3>;
    
    // Blockquote (> quoted text)
    if (line.startsWith("> "))   return <blockquote key={i} dangerouslySetInnerHTML={{__html: b(line.slice(2))}} />;
    
    // Unordered List Item (- item)
    if (line.startsWith("- "))   return <ul key={i}><li dangerouslySetInnerHTML={{__html: b(line.slice(2))}} /></ul>;
    
    // Ordered List Item (1. item, 2. item, etc.)
    // Regex test for pattern: number followed by period and space
    if (/^\d+\. /.test(line))    return <ol key={i}><li dangerouslySetInnerHTML={{__html: b(line.replace(/^\d+\. /,""))}} /></ol>;
    
    // Empty line - creates line break
    if (line === "")             return <br key={i} />;
    
    // Regular paragraph text
    return <p key={i} dangerouslySetInnerHTML={{__html: b(line)}} />;
  });
}

// ─── THEME CONTEXT ───────────────────────────────────────────────────────────