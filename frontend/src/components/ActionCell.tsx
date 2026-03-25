import { useState } from 'react';
import { Edit, Trash2, Share2, MoreVertical } from 'lucide-react';
import { ActionsCellPropsProj } from '../types/projects';
import { ActionsCellPropsForum } from '../types/forum';


export function ActionsCellProj({entry, startRename}: ActionsCellPropsProj) {
    const [open, setOpen] = useState(false);

    return (
        <td className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(!open);
                }}
                className="p-1 nz-background-primary rounded-full hover:nz-background-secondary"
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-32 rounded-md shadow-lg border nz-background-accent z-50">
                    <button onClick={(e) => {e.stopPropagation(); setOpen(!open); startRename(entry)}} className="flex w-full text-left px-3 py-2 hover:nz-background-primary rounded-t-md">
                        <Edit className='w-4 h-4 mr-2' />Edit
                    </button>

                    <button onClick={(e) => {e.stopPropagation(); setOpen(!open);}} className="flex w-full text-left px-3 py-2 hover:nz-background-primary">
                        <Trash2 className='w-4 h-4 mr-2' />Delete
                    </button>

                    <button onClick={(e) => {e.stopPropagation(); setOpen(!open);}} className="flex w-full text-left px-3 py-2 hover:nz-background-primary rounded-b-md">
                        <Share2 className='w-4 h-4 mr-2' />Share
                    </button>
                </div>
            )}
        </td>
    );
}

export function ActionsCellForum({onEdit, onDelete}: ActionsCellPropsForum) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(!open);
                }}
                className="nz-background-accent p-2 rounded-full hover:nz-bg-hover absolute right-1 top-1"
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {open && (
                <div className="absolute right-0 top-10 w-32 rounded-md shadow-lg border nz-background-accent z-50">
                    <button onClick={(e) => {e.stopPropagation(); setOpen(!open); onEdit()}} className="flex items-center w-full text-left px-3 py-2 hover:nz-background-primary rounded-t-md">
                        <Edit className='w-4 h-4 mr-2' />Edit
                    </button>

                    <button onClick={(e) => {e.stopPropagation(); setOpen(!open); onDelete()}} className="flex items-center w-full text-left px-3 py-2 hover:nz-background-primary">
                        <Trash2 className='w-4 h-4 mr-2' />Delete
                    </button>

                    <button onClick={(e) => {e.stopPropagation(); setOpen(!open);}} className="flex items-center w-full text-left px-3 py-2 hover:nz-background-primary rounded-b-md">
                        <Share2 className='w-4 h-4 mr-2' />Share
                    </button>
                </div>
            )}
        </>
)}
