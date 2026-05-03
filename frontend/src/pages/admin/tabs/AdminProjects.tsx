import React, {useState, useEffect} from 'react';
import { Pen } from 'lucide-react';
import { ProjectCard } from '../../../components/shared/cards/ProjectCard';
import { ProjectManage } from '../../../components/shared/modal/modals/projects/ProjectManage';
import { ConfirmModal } from '../../../components/shared/modal/ConfirmModal';
import { Skeleton } from '../../../components/LoadingSpinner';

import { useToast } from '../../../providers/MessageProvider';
import { useModal } from '../../../hooks/useModal';
import { Project } from '../../../types/projects';

import { getCsrfToken } from '../../../api/auth';
import { projectsList, projectDelete } from '../../../api/admin';

export default function AdminProjects() {
    const { showToast } = useToast();
    const { openModal, closeModal } = useModal();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const getProjects = async () => {
        try {
            await getCsrfToken()
            const data = await projectsList()
            setProjects (data.projects);
        } catch (err) {
            console.error ("Error geting projects: ", err)
            showToast('error', 'Error', 'Not can load the projects');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getProjects();
    }, []);


    const DeleteProject = async (id: any) => {
        try {
            openModal({
                id: 'confirm-admin-delete-project',
                title:
                <div>
                    <p><span className='text-blue-400'>[Admin]</span> Confirm delete project</p>
                </div>,
                content: (
                    <ConfirmModal
                        message="You shure to delete this project?"
                        confirmText="Yes, del"
                        cancelText="Cancel"
                        onConfirm={async () => {await projectDelete (id); getProjects(); closeModal(); showToast ("info", "Succes operation", "Project was successful deletet.");}}
                        onCancel={() => {closeModal()}}
                    />
                )
            });
        } catch (error) {
            showToast ('error', 'Error deleting project', 'Happened some trables deleting project.');
            console.error(`Error deleting project: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    const handleAdminEdit = (proj: Project) => {
        openModal({
            id: 'edit-project',
            width: "lg",
            title: (
                <div className="flex items-center gap-2">
                    <Pen className="w-5 h-5 text-primary" />
                    <span className="line-clamp-1"><span className='text-blue-400'>[Admin]</span> Edit Project "{proj.title}"</span>
                </div>
            ),
            content: (
                <ProjectManage
                    project={proj}
                    onSuccess={() => {getProjects()}}
                    onDelete={() => {DeleteProject(proj.id)}}
                    isAdminMode={true}
                />
            ),
        });
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                    <div key={i}>
                        <Skeleton className="w-64 h-50 rounded-[18px]" />
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div>
            {projects.length === 0 ? (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-semibold mb-2">Projects Management</h2>
                    <p className="text-zinc-400">Here you can manage projects and their permissions.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {projects.map((proj: Project) => (
                        <ProjectCard
                            key={proj.id}
                            id={proj.id}
                            proj={proj}
                            title={proj.title}
                            description={proj.description}
                            technologies={proj.technologies.split(', ')}
                            status={proj.status}
                            image={proj.image}
                            owner={proj.owner}
                            canEdit={true}
                            onEdit={() => handleAdminEdit(proj)}
                            loadProjs={getProjects}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}