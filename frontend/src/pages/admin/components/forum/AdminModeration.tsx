import React from 'react';
import { CheckCircle, XCircle, Users } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

export default function AdminModeration() {
    // Тимчасові дані (канали на модерацію)
    const pendingChannels = [
        {
            id: 101,
            name: "Cyber Security Ukraine",
            owner: "andre_k",
            subscribers: 124,
            description: "Канал про кібербезпеку, захист та хакерство в Україні",
        },
    ];

    const handleApprove = (id: number) => {
        alert(`Канал ${id} схвалено`); // пізніше заміниш на реальний API
    };

    const handleReject = (id: number) => {
        alert(`Канал ${id} відхилено`);
    };

    return (
        <div className="space-y-4">
            {pendingChannels.map((channel) => (
                <div key={channel.id} className="bg-nz-background-secondary border border-border rounded-2xl p-6">
                    <div className="flex justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-red-500 rounded-2xl flex items-center justify-center text-white font-bold">
                                {channel.name[0]}
                            </div>
                            <div>
                                <p className="font-semibold text-white">{channel.name}</p>
                                <p className="text-xs nz-text-muted">@{channel.owner}</p>
                                <p className="text-sm text-zinc-400 mt-2 line-clamp-2">
                                    {channel.description}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button 
                                onClick={() => handleApprove(channel.id)}
                                variant="btn_success"
                                size="sm"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Схвалити
                            </Button>
                            <Button 
                                onClick={() => handleReject(channel.id)}
                                variant="btn_destructive"
                                size="sm"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Відхилити
                            </Button>
                        </div>
                    </div>
                </div>
            ))}

            {pendingChannels.length === 0 && (
                <div className="text-center py-16 text-zinc-400">
                    Немає каналів на модерацію
                </div>
            )}
        </div>
    );
}