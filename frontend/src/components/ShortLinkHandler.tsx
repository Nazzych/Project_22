import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { decodePath } from '../lib/encoder';
import { slugify } from '../lib/slugify';
import { forumList, getChannel } from '../api/forum';

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

        const [codedType, codedId, codedSlug] = parts;

        const tryDecode = async () => {
            const possibleTypes = ['channel', 'post', 'challenge', 'course', 'project'];

            for (const typeValue of possibleTypes) {
                try {
                    const decoded = await decodePath(codedId, codedType, codedSlug, typeValue);
                    let targetPath = '';
                    switch (decoded.type) {
                        case 'channel':
                            targetPath = `/forum/channel/${decoded.id}`;
                            if (decoded.slug && decoded.slug !== 'share') targetPath += `/${decoded.slug}`;
                            break;
                        case 'post':
                            // Try to find post and its channel, then redirect to channel view with highlight
                            try {
                                const channelId = Number(decoded.slug) || 0
                                if (channelId) {
                                    try {
                                        const channelData = await getChannel(Number(channelId));
                                        const slug = channelData.slug || slugify(channelData.name) || '';
                                        targetPath = `/forum/channel/${channelId}/${slug}?postId=${decoded.id}`;
                                        break;
                                    } catch (e) {
                                        // fallback to forum listing if channel fetch fails
                                        console.error('Failed fetching channel for post redirect', e);
                                    }
                                }
                            } catch {
                                console.error('Error decoding post url!')
                            }
                            // fallback: redirect to forum listing and highlight the post by id
                            targetPath = `/forum?postId=${decoded.id}`;
                            break;
                        case 'challenge':
                            targetPath = `/challenges/${decoded.id}`;
                            break;
                        case 'course':
                            targetPath = `/courses/${decoded.id}`;
                            break;
                        case 'project':
                            targetPath = `/projects/${decoded.id}/${decoded.slug}`;
                            break;
                        default:
                            continue;
                    }

                    console.log(`✅ Successfully decoded! Redirecting to: ${targetPath}`);
                    navigate(targetPath, { replace: true });
                    return;
                } catch (e) {
                    console.error(`Failed with type ${typeValue}`);
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