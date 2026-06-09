import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { decodePath } from '../lib/encoder';   // ← змініть шлях якщо потрібно

export default function ShortLinkHandler() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fullPath = location.pathname;
        console.log("🔍 Full path:", fullPath);

        // Прибираємо /s/ і розбиваємо
        const pathAfterS = fullPath.replace('/s/', '').trim();
        const parts = pathAfterS.split('/').filter(Boolean);

        console.log("Parts:", parts);

        if (parts.length < 3) {
            navigate('/', { replace: true });
            return;
        }

        const [codedId, codedType, codedSlug] = parts;

        const tryDecode = async () => {
            const possibleTypes = ['channel', 'post', 'challenge', 'course', 'project'];

            for (const typeValue of possibleTypes) {
                try {
                    const decoded = await decodePath(codedId, codedType, codedSlug, typeValue);

                    let targetPath = '';

                    switch (decoded.type) {
                        case 'channel': targetPath = `/forum/channel/${decoded.id}`; break;
                        case 'post':    targetPath = `/forum/post/${decoded.id}`; break;
                        case 'challenge': targetPath = `/challenges/${decoded.id}`; break;
                        case 'course':  targetPath = `/courses/${decoded.id}`; break;
                        case 'project': targetPath = `/projects/${decoded.id}`; break;
                        default: continue;
                    }

                    if (decoded.slug && decoded.slug !== 'share') {
                        targetPath += `/${decoded.slug}`;
                    }

                    console.log(`✅ Successfully decoded! Redirecting to: ${targetPath}`);
                    navigate(targetPath, { replace: true });
                    return;
                } catch (e) {
                    // console.log(`Failed with type ${typeValue}`);
                    continue;
                }
            }

            // Якщо нічого не підійшло
            console.warn("❌ Could not decode any type");
            navigate('/', { replace: true });
        };

        tryDecode();

    }, [location.pathname, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
            <div className="text-center">
                <p>Перенаправляємо...</p>
                <p className="text-xs text-zinc-500 mt-4">Будь ласка, зачекайте</p>
            </div>
        </div>
    );
}