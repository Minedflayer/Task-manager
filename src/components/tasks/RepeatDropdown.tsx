"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface RepeatDropdownProps {
    value: string;
    onChange: (value: string) => void;
}

const REPEAT_OPTIONS = [
    { id: 'none', label: 'Does not repeat' },
    { id: 'daily', label: 'Every day' },
];

export function RepeatDropdown({ value, onChange }: RepeatDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedOption = REPEAT_OPTIONS.find((o) => o.id === value) || REPEAT_OPTIONS[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);

    }, []);


    return (
        <div className='relative' ref={dropdownRef}>
            <button
                type='button'
                onClick={() => setIsOpen(!isOpen)}
                className='flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg hover: bg-slate-100 transition-colors text-slate-700'>
                <span>{selectedOption.label} </span>
                <ChevronDown size={14} className='text-slate-400' />
            </button>


            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
                    {REPEAT_OPTIONS.map((option) => (
                        <button
                            key={option.id}
                            type='button'
                            onClick={() => {
                                onChange(option.id);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-slate-50 text-slate-700 transition-colors"

                        >
                            {option.label}
                            {value === option.id && <Check size={14} className='text-indigo-600' />}

                        </button>


                    ))}
                </div>

            )}
        </div>
    );
}