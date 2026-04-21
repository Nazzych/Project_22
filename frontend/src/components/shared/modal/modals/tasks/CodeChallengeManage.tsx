import React from 'react';
import { Code2 } from 'lucide-react';

import { Input } from '../../../../ui/Input';
import { Textarea } from '../../../../ui/Textarea';
import { CodeEditor } from '../../../../CodeEditor';

interface CodeChallengeManageProps {
    form: any;
    setForm: React.Dispatch<React.SetStateAction<any>>;
}

export function CodeChallengeManage({ form, setForm }: CodeChallengeManageProps) {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Example Input */}
                <div>
                    <label className="block text-sm font-medium mb-1.5">Example Input</label>
                    <Textarea
                        name="e_input"
                        value={form.e_input || ''}
                        onChange={handleChange}
                        rows={4}
                        placeholder="nums = [2, 7, 11, 15], target = 9"
                    />
                </div>

                {/* Example Output */}
                <div>
                    <label className="block text-sm font-medium mb-1.5">Example Output</label>
                    <Textarea
                        name="e_output"
                        value={form.e_output || ''}
                        onChange={handleChange}
                        rows={4}
                        placeholder="[0, 1]"
                    />
                </div>
            </div>

            {/* Starter Code */}
            <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center gap-2">
                    <Code2 className="w-4 h-4" />
                    Starter Code
                </label>
                <div className="border border-zinc-700 rounded-3xl overflow-hidden h-[340px]">
                    <CodeEditor
                        value={form.code || ''}
                        onChange={(value) => 
                            setForm((prev: any) => ({ ...prev, code: value }))
                        }
                    />
                </div>
            </div>
        </div>
    );
}