import Editor, { useMonaco } from "@monaco-editor/react";

const extensionToLanguage: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    pyc: "python",
    json: "json",
    html: "html",
    css: "css",
    scss: "scss",
    md: "markdown",
    ini: "ini",
    yml: "yaml",
    yaml: "yaml",
    pem: "plaintext",
    txt: "plaintext",
    pdf: "plaintext",
    csv: "plaintext",
    sqlite3: "plaintext",
    xml: "xml",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    go: "go",
    java: "java",
    dart: "dart",
    rust: "rust",
    swift: "swift",
    bath: "bat",
    shadowroot: "plaintext"
};

export function CodeEditor({ value, onChange, file }: { value: string; onChange: (v: string) => void; file?: string }) {
    const ext = file?.split(".").pop()?.toLowerCase() || "txt";
    const language = extensionToLanguage[ext] || "plaintext";

    return (
        <div className="h-[58vh] md:h-[72.5vh] overflow-hidden nz-background-accent">
            <Editor
                height="100%"
                defaultLanguage={language}
                value={value}
                onChange={(val) => onChange(val || "")}
                theme="hc-black" //? "vs-dark"
                options={{
                    automaticLayout: true,
                    //? minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    folding: false,
                    renderLineHighlight: "line", //? "all" / "gutter"
                    renderValidationDecorations: "off",
                    accessibilitySupport: "off",
                    //? quickSuggestions: false,
                    //? suggestOnTriggerCharacters: false,
                }}
            />
        </div>
    );
}