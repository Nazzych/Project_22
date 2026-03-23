import React, { forwardRef } from 'react';
import { cn } from '../../lib/cn';
import { TextareaProps } from '../../types/componentsUI';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, icon, resizable = false, ...props }, ref) => (
        <div className="relative w-full">
            {icon && (
                <div className="absolute left-3 top-3">
                    {icon}
                </div>
            )}
            <textarea
                ref={ref}
                rows={2}
                className={cn(
                    'w-full min-h-[60px] max-h-[400px] rounded-xl nz-bg-input nz-text-input focus:nz-ring px-3 py-2 text-sm transition duration-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                    icon && 'pl-10',
                    !resizable && 'resize-none',
                    className
                )}
                {...props}
            />
        </div>
    )
);

Textarea.displayName = 'Textarea';

// import React, { forwardRef } from 'react';
// import { cn } from '../../lib/cn';
// import { TextareaProps } from '../../types/componentsUI';

// export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
//   ({ className, icon, resizable = false, rows = 2, ...props }, ref) => (
//     <div className="relative w-full h-full">
//       {icon && (
//         <div className="absolute left-3 top-3">
//           {icon}
//         </div>
//       )}
//       <textarea
//         ref={ref}
//         rows={rows}
//         className={cn(
//           'w-full rounded-xl nz-bg-input nz-text-input focus:nz-ring px-3 py-2 text-sm transition duration-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
//           icon && 'pl-10',
//           !resizable && 'resize-none',
//           rows === 100 ? 'h-full' : 'min-h-[60px] max-h-[400px]',
//           className
//         )}
//         {...props}
//       />
//     </div>
//   )
// );


// Textarea.displayName = 'Textarea';
