// src/pages/NotFound404.tsx
import { Link } from 'react-router-dom';
import { Ghost, ArrowLeft } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const tips = [
    '💡 Tip: Always commit before refactoring!',
    '🧪 Debugging is like being the detective in a crime movie where you are also the murderer.',
    '📦 Remember to `git pull` before you `git push`.',
    '🧘‍♂️ Take a break. Even the best code needs fresh eyes.',
    '🚫 404: Coffee not found. Please refill and try again.',
];

const randomTip = tips[Math.floor(Math.random() * tips.length)];

export default function NotFound404() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex flex-col items-center justify-center nz-background-primary nz-text-foreground p-6">
            <div className="text-center animate-fade-in">
                <div className="flex justify-center mb-6">
                    <Ghost className="w-20 h-20 text-zinc-400 animate-float" />
                </div>
                <h1 className="text-6xl font-extrabold tracking-tight mb-4">404</h1>
                <p className="text-xl text-zinc-300 mb-2">Oops! This page vanished into the void.</p>
                <p className="text-zinc-400 mb-6">The page you're looking for doesn't exist or has been moved.</p>

                {/* Code block */}
                <div className="my-8 nz-background-accent border border-zinc-700 rounded-lg p-4 text-left text-sm font-mono text-zinc-400 max-w-xl mx-auto">
                    <p>// Error: PageNotFoundException</p>
                    <p className="text-green-400 animate-typing overflow-hidden whitespace-nowrap border-r-2 border-green-400 pr-2">
                        throw new Error("404 - Resource not found");
                    </p>
                    <p>↳ at <span className="text-zinc-300">/src/routes/unknown.tsx:1:1</span></p>
                    <br />
                    <p>[---------------------------------------------------]</p>
                    <br />
                    <p>// TODO: Maybe don’t let users get lost in the void next time 😅</p>
                    <p>at renderPage (/src/components/PageRenderer.tsx:42:13)</p>
                    <p>at App (/src/App.tsx:10:5)</p>
                    <p>» user@localhost:~$ <span className="animate-ping text-green-400">█</span></p>
                </div>

                {/* Developer tip */}
                <p className="mt-4 text-sm text-zinc-500 italic">{randomTip}</p>

                {/* ASCII art */}
                <pre className="text-xs text-zinc-500 font-mono mt-6">
                    {String.raw`
   (╯°□°）╯︵ ┻━┻
   // 404 - Table not found
`}
                </pre>

                {/* Back button */}
                <Link
                    to="/"
                    className="absolute top-4 left-4 inline-flex items-center gap-2 px-4 py-2 rounded nz-background-secondary text-foreground hover:nz-bg-hover transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go back home
                </Link>
                <button
                    onClick={() => navigate (-1)}
                    className="absolute top-16 left-4 inline-flex items-center gap-2 px-4 py-2 rounded nz-background-secondary text-foreground hover:nz-bg-hover transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go back
                </button>
            </div>
        </div>
    );
}
