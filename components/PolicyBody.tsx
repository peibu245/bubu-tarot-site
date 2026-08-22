export default function PolicyBody({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return (
    <div className="policy-body editable-copy">
      {blocks.map((block, index) => {
        if (block.startsWith("## ")) return <h2 key={index}>{block.slice(3)}</h2>;
        if (block.startsWith("### ")) return <h3 key={index}>{block.slice(4)}</h3>;
        const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
        if (lines.every((line) => line.startsWith("- "))) return <ul key={index}>{lines.map((line) => <li key={line}>{line.slice(2)}</li>)}</ul>;
        return <p key={index}>{lines.map((line, lineIndex) => <span key={`${index}-${lineIndex}`}>{lineIndex > 0 && <br />}{line}</span>)}</p>;
      })}
    </div>
  );
}
