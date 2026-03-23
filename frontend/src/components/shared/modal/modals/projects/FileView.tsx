import React, { useEffect, useState } from 'react';
import {
    Minimize,
    Save,
    Download,
    Copy,
    CopyCheck,
    MinusCircle,
    Check,
} from 'lucide-react';
import { FileNode, FullscreenFileViewProps } from '../../../../../types/projects';
import { useProfile } from '../../../../../contexts/ProfileContext';
import { useToast } from '../../../../../providers/MessageProvider';
import { getCsrfToken } from '../../../../../api/auth';
import { Button } from '../../../../ui/Button';
import { LoadingSpinner } from '../../../../LoadingSpinner';
import { useModal } from '../../../../../hooks/useModal';
import { ConfirmModal } from '../../ConfirmModal';
import { CodeEditor } from '../../../../CodeEditor';

export function FullscreenFileView({
    fileContent,
    editContent,
    project,
    file,
    onSave,
    onDownload,
    onDelete,
    onClose
}: FullscreenFileViewProps) {
    const { profile } = useProfile();
    const { showToast } = useToast();
    const { openModal, closeModal } = useModal();

    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editContentState, setEditContentState] = useState(editContent);

    const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; text: string } | null>(null);
    const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
    const [currentFolder, setCurrentFolder] = useState<FileNode | null>(null);
    const [fileContentState, setFileContent] = useState(editContent);

    const isModified = editContentState !== fileContent;

    useEffect(() => {
        const saved = localStorage.getItem('isSaved');
        if (saved == "true") {
            setIsSaving(true);
            const timeout = setTimeout(() => {
                setIsSaving(false);
                localStorage.removeItem('isSaved');
            }, 20000);
            return () => clearTimeout(timeout);
        }
    }, []);

    const handleFullScreenHide = async () => {
        localStorage.setItem('savedFile', editContentState);
        const saving = localStorage.getItem("isSaved")
        if (isModified && saving !== "true") {
            // showToast("info", "✔️ Detected changes");
            openModal({
                id: 'confirm-save-file',
                title: 'Confirm saving file',
                content: (
                    <ConfirmModal
                        message="You don't want to save this file?"
                        confirmText="Yes, save"
                        cancelText="Cancel"
                        onConfirm={() => {saveFile(); onClose()}}
                        onCancel={() => {onClose()}}
                    />
                ),
            });
        } else {
            // showToast("info", "❌ UnDetected changes");
            onClose();
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(editContentState);
        setCopied(true);
        showToast("success", "Copied!", "Content copied to clipboard.");
        setTimeout(() => setCopied(false), 1500);
    };

//  localStorage.setItem('isSaved', "true"); setIsSaving(true); setSaved(true); setTimeout(() => {setSaved(false);}, 1000); onClose(); setTimeout(() => {setIsSaving(false);}, 20000);

    const saveFile = async () => {
        try {
            //? showToast("info", "Saving...", `${folder} | ${content.substring(0, 400)}`);
            localStorage.setItem('isSaved', "true");
            localStorage.setItem('savedFile', editContentState);
            onSave();
            setIsSaving(true);
            setSaved(true);
        } catch (err) {
            console.error(err);
            showToast("error", "Save failed", "An error occurred while saving the file.");
            return;
        } finally {
            setTimeout(() => {
                setSaved(false);
            }, 1000);
            setTimeout(() => {
                localStorage.removeItem('isSaved');
                setIsSaving(false);
            }, 20000);
        };
    };

    const handleDelete = async (filePath: string) => {
        await getCsrfToken();
        onDelete();
        setSelectedFile(null);
        setFileContent('');
        onClose();
        if (currentFolder && currentFolder.children) {
            const updatedChildren = currentFolder.children.filter(child => child.name !== filePath);
            setCurrentFolder({ ...currentFolder, children: updatedChildren });
        }
    };

    return (
        <div className="space-y-2">
            {profile && project.owner.username === profile.username ? (
                <>
                    <div className="relative rounded-xl overflow-hidden border-2 nz-border">
                        <CodeEditor
                            value={editContentState}
                            file={String(file?.name)}
                            onChange={(newValue) => setEditContentState(newValue)}
                        />
                        {(isSaving) && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded">
                                <span className="text-white text-md py-1 px-4 nz-background-secondary rounded-xl font-medium">
                                    <LoadingSpinner text='Saving and security checking...' />
                                    <span className='bottom-0 text-right text-[8.75px] nz-text-muted'>*Can take 30 seconds.</span>
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-center sm:justify-between gap-2 px-2">
                        <div className="inline-flex rounded-full overflow-hidden border">
                            <Button
                                className="rounded-none rounded-l-full"
                                onClick={handleCopy}
                                disabled={!editContent}
                            >
                                {copied ? (
                                    <CopyCheck className="w-4 h-4 text-green-400 transition-all duration-200" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </Button>

                            <Button onDoubleClick={() => onDownload()} disabled={isSaving || !editContent} className="relative rounded-none">
                                <Download className="w-4 h-4" />
                                <span className='absolute -bottom-1 text-[7px] nz-text-muted'>Double click</span>
                            </Button>
                            <span className="relative"
                                onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setTooltipPos({ top: rect.top, left: rect.left + rect.width / 2, text: 'Delete the current file' });
                                }}
                                onMouseLeave={() => setTooltipPos(null)}>
                                <Button onDoubleClick={() => handleDelete(selectedFile?.name || '')} disabled={isSaving} className="relative rounded-none">
                                    <MinusCircle className="w-4 h-4" />
                                    <span className='absolute -bottom-1 text-[7px] nz-text-muted'>Double click</span>
                                </Button>
                                {tooltipPos && (
                                    <div 
                                        className="fixed w-max max-w-xs nz-background-accent border rounded-md shadow-lg p-2 text-xs nz-text-foreground z-50 whitespace-pre-wrap break-words pointer-events-none animate-in fade-in"
                                        style={{
                                            top: `${tooltipPos.top}px`,
                                            left: `${tooltipPos.left}px`,
                                            transform: 'translate(-50%, -110%)',
                                        }}
                                    >
                                        {tooltipPos.text}
                                    </div>
                                )}
                            </span>

                            <Button
                                className="rounded-r-full"
                                onClick={() => saveFile()} //? saveFile.bind(null, editContent)
                                disabled={!isModified}
                            >
                                {saved ? (
                                    <Check className="w-4 h-4 text-green-400 transition-all duration-200" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        <Button className="rounded-full" onClick={() => handleFullScreenHide()}>
                            <Minimize className="w-4 h-4 mr-2" />
                            Close
                        </Button>
                    </div>
                </>
            ) : (
                <pre className="whitespace-pre-wrap text-white bg-zinc-900 p-4 rounded text-sm h-[70vh] overflow-auto">
                    {fileContent || 'Loading content...'}
                </pre>
            )}
        </div>
    );
}
