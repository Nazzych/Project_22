import { Settings, Pen, User, Folders, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProjectCardProps, Project } from '../../../types/projects';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { useRef, useState } from 'react';
import { useModal } from '../../../hooks/useModal';
import { ConfirmModal } from '../../shared/modal/ConfirmModal';
import { ProjectManage } from '../../shared/modal/modals/projects/ProjectManage';
import { getCsrfToken } from '../../../api/auth';
import { useToast } from '../../../hooks/useToast';
import { deleteProject } from '../../../api/projects';

export const ProjectCard = ({
    id,
    proj,
    owner,
    image,
    title,
    technologies,
    status,
    canEdit,
    onEdit,
    loadProjs
}: ProjectCardProps) => {
    const navigate = useNavigate();
    const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
    const tagRef = useRef<HTMLSpanElement>(null);
    const { openModal, closeModal } = useModal();
    const { showToast } = useToast();

    const slugify = (text: string) =>
        text
            .toLowerCase()
            .trim()
            .replace(/[\s\W-]+/g, '-')
            .replace(/^-+|-+$/g, '');

    const handleView = () => {
        const slug = slugify(title);
        navigate(`/projects/${owner.id}/${id}-${slug}`);
    };

    const handleTagHover = () => {
        if (tagRef.current) {
            const rect = tagRef.current.getBoundingClientRect();
            setTooltipPos({
                top: rect.top - 10,
                left: rect.left + rect.width / 2,
            });
        }
    };

    const DeleteProject = async (id: any) => {
        try {
            openModal({
                id: 'confirm-delete-project',
                title: 'Confirm delete project',
                content: (
                    <ConfirmModal
                        message="You real want to delete this project?"
                        confirmText="Yes, del"
                        cancelText="Cancel"
                        onConfirm={async () => {await getCsrfToken(); await deleteProject (id); loadProjs(); closeModal(); showToast ("success", "Succes operation", "Project was successful deletet.");}}
                        onCancel={() => {closeModal()}}
                    />
                )
            });
        } catch (error) {
            showToast ('error', 'Error deleting project', 'Happened some trables deleting project.');
            console.error(`Error deleting project: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    const handleClick = (proj: Project) => {
        openModal({
            id: 'edit-project',
            x: false,
            width: "lg",
            title: (
                <div className="flex items-center gap-2">
                    <Pen className="w-5 h-5 text-primary" />
                    <span className='line-clamp-1'>Edit Project "{proj.title}"</span>
                </div>
            ),
            content: (
                <ProjectManage
                    project={proj}
                    onSuccess={() => loadProjs()}
                    onDelete={() => DeleteProject(proj.id)}
                />
            ),
        });
    };
    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();           // важливо!
        if (onEdit) {
            onEdit(id);                // для адміна
        } else {
            handleClick(proj);         // для звичайного користувача
        }
    };

    return (
        <Card onClick={(e) => {e.stopPropagation(); handleView();}}
            variant="card_primary"
            className="group relative transition duration-300 border overflow-hidden hover:nz-text-hover cursor-pointer"
        >
            {image ? (
                <div className="relative h-32 w-full group-hover:opacity-75">
                    <img src={image} alt={title} className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute bottom-2 left-2 nz-bg-info nz-text-info text-[10px] font-semibold p-1 rounded-full uppercase z-10">
                        {status}
                    </span>
                </div>
            ) : (
                <div className="flex justify-center items-center h-32 w-full">
                    <span className='p-2 flex items-center nz-background-secondary rounded-xl text-md gap-1 capitalize'><Folders className='w-16 h-16' />{status}</span>
                </div>
            )}
            <CardHeader className='py-2'>
                <div className='flex flex-row justify-between items-center py-1'>
                    <p className="flex flex-row text-xs text-muted-foreground truncate hover:underline hover:cursor-pointer"><User className='w-4 h-4 mr-1' /> @{owner.username}</p>
                    {canEdit && (
                        <div className='space-x-2'>
                            <button className='hover:nz-background-secondary p-1 rounded-full'
                                onClick={(e) => {handleEditClick(e)}}><Settings className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
                <h3 className="text-lg h-14 font-semibold nz-text-foreground line-clamp-2">{title}</h3>
            </CardHeader>

            <CardContent>
                <div className="flex items-center flex-wrap gap-2 relative z-0">
                    {technologies.length && (
                        <div className="relative">
                            <span 
                                ref={tagRef}
                                onClick={(e) => e.stopPropagation()}
                                onMouseEnter={handleTagHover}
                                onMouseLeave={() => setTooltipPos(null)}
                                className="text-xs nz-background-secondary px-2 py-1 rounded-full text-muted-foreground border cursor-default"
                            >
                                Tags here
                            </span>

                            {/* Tooltip - Fixed positioning */}
                            {tooltipPos && (
                                <div 
                                    className="fixed w-max max-w-xs nz-background-accent border rounded-md shadow-lg p-2 text-xs nz-text-foreground z-50 whitespace-pre-wrap break-words pointer-events-none animate-in fade-in"
                                    style={{
                                        top: `${tooltipPos.top}px`,
                                        left: `${tooltipPos.left}px`,
                                        transform: 'translate(-50%, -100%)',
                                    }}
                                >
                                    {technologies.join(', ')}
                                </div>
                            )}
                        </div>
                    )}
                    <span className="flex items-center text-[10px] nz-text-muted">
                        <Star className="w-4 h-4 mr-1" />
                        {proj.stars.toLocaleString()}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};
