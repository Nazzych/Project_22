import React, { useState } from 'react';
import { Folder, File, ChevronDown, ChevronRight } from 'lucide-react';

interface FileNode {
    name: string;
    type: 'folder' | 'file';
    children?: FileNode[];
}

interface RenderTreeProps {
    node: FileNode;
    prefix?: string;
    isLast?: boolean;
    isRoot?: boolean;
}

export const RenderTree = ({
    node,
    prefix = '',
    isLast = true,
    isRoot = true,
}: RenderTreeProps) => {
    const [isOpen, setIsOpen] = useState(isRoot); // Коренева папка завжди відкрита

    const hasChildren = node.type === 'folder' && (node.children?.length ?? 0) > 0;

    const toggleOpen = () => {
        if (hasChildren) setIsOpen(!isOpen);
    };
// === СОРТУВАННЯ: ПАПКИ ЗВЕРХУ, ФАЙЛИ ЗНИЗУ ===
    const sortedChildren = node.children ? 
        [...node.children].sort((a, b) => {
            if (a.type === b.type) {
                return a.name.localeCompare(b.name); // всередині одного типу — за алфавітом
            }
            return a.type === 'folder' ? -1 : 1; // папки завжди першими
        }) : [];

    //? const connector = isRoot ? '' : isLast ? '   └── ' : '   ├── ';
    //? const newPrefix = prefix + (isLast ? '       ' : '   │   ');
    const connector = isRoot ? '' : isLast ? '└── ' : '├── ';
    const newPrefix = prefix + (isLast ? '   ' : '│   ');

    return (
        <div className="font-mono text-sm select-none">
            {/* Поточний рядок */}
            <div 
                className={`flex items-center py-[3px] px-1 rounded-md hover:bg-zinc-800/60 cursor-pointer group`}
                onClick={toggleOpen}
            >
                {/* Вертикальна лінія + конектор */}
                {!isRoot && (
                    <span className="text-right">
                        {prefix + connector}
                    </span>
                )}

                {/* Chevron */}
                {hasChildren && (
                    <span className="mr-1 text-zinc-400 group-hover:text-zinc-200 transition-transform duration-150">
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </span>
                )}

                {/* Іконка */}
                {node.type === 'folder' ? (
                    <Folder className="w-4 h-4 mr-2 text-yellow-400" />
                ) : (
                    <File className="w-4 h-4 mr-2 text-blue-400" />
                )}

                {/* Назва */}
                <span className="text-zinc-100">
                    {node.name.replace("root", "CODEHUB")}
                </span>
            </div>

            {/* Дочірні елементи з вертикальною лінією */}
            {hasChildren && isOpen && (
                <div>
                    {sortedChildren.map((child, index) => (
                        <RenderTree
                            key={child.name + index}
                            node={child}
                            prefix={newPrefix}
                            isLast={index === sortedChildren.length - 1}
                            isRoot={false}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


//     const RenderTree = ({
//         node,
//         prefix = '',
//         isLast = true,
//         isRoot = true,
//     }: {
//         node: FileNode;
//         prefix?: string;
//         isLast?: boolean;
//         isRoot?: boolean;
//     }) => {
//         const connector = isRoot ? '' : isLast ? '└── ' : '├── ';
//         const icon =
//             node.type === 'folder' ? (
//                 <Folder className="inline w-4 h-4 mr-1 text-yellow-500" />
//             ) : (
//                 <File className="inline w-4 h-4 mr-1 text-blue-500" />
//             );

//         const newPrefix = prefix + (isLast ? '    ' : '│   ');
//         const children = node.children || [];
// //? {node.name.replace ("root", "main")}
//         return (
//             <>
//                 <div className="font-mono text-sm">
//                     <span className="nz-text-muted">{prefix + connector}</span>
//                     {icon}
//                     {node.name.replace ("root", "CODEHUB")}
//                 </div>
//                 {/* <div className="font-mono text-sm m-2">
//                     <span className="nz-text-muted">{prefix + connector}</span>
//                     <span className='p-1 nz-background-accent rounded-md w-fit'>{icon}{node.name}</span>
//                 </div> */}

//                 {children.map((child, index) => (
//                     <RenderTree
//                     key={child.name + child.type}
//                     node={child}
//                     prefix={newPrefix}
//                     isLast={index === children.length - 1}
//                     isRoot={false}
//                     />
//                 ))}
//             </>
//         );
//     };
