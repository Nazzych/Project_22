import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Image } from '../../components/Image';

export default function AdminHeader() {
    return (
        <>
            <div className="flex items-center justify-center gap-4 p-2 nz-background-primary rounded-3xl">
                <div className="w-24 h-24 font-mono rounded-full overflow-hidden border-2">
                    <Image src='/nz-logo.png' alt='Nezer Hill Foundation' />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white font-['Orbitron']">
                        Nezer Hill Foundation
                    </h1>
                    <p className="text-zinc-400 text-sm tracking-wide font-['Rajdhani']">
                        Secret Research • Innovation • Future
                    </p>
                </div>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <ShieldAlert className="h-7 w-7 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Control Center</h1>
                        <p className="text-zinc-400 mt-1">
                            System administration & content management
                        </p>
                    </div>
                </div>

                <div className="w-fit flex items-center gap-2 px-5 py-2 mt-4 lg:mt-0 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    System Online
                </div>
            </div>
        
        </>
    );
}