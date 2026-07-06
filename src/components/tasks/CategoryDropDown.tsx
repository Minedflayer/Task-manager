import { Fragment } from 'react';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption, Transition } from '@headlessui/react';
import { Tag, ChevronDown, Check } from 'lucide-react';
import { observer } from '@legendapp/state/react';
import { state$ } from '@/lib/state/store';
import type { Category } from '@/lib/state/store'; // Adjust import path if needed

interface CategoryDropdownProps {
    selectedId: string;
    onChange: (id: string) => void;
}

export const CategoryDropdown = observer(function CategoryDropdown({ selectedId, onChange }: CategoryDropdownProps) {
    // Find the full category object based on the selected I
    const categories = state$.categories.get();
    const selectedCategory = categories.find(c => c.id === selectedId) || null;

    return (
        <Listbox value={selectedId} onChange={onChange}>
            <div className="relative z-20">
                {/* The Trigger Button */}
                <ListboxButton className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm text-slate-600 hover:bg-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                    <Tag size={14} className="text-slate-400" />
                    <span className="block truncate max-w-[120px]">
                        {selectedCategory ? selectedCategory.name : "No Category"}
                    </span>
                    <ChevronDown size={14} className="text-slate-400 ml-1" />
                </ListboxButton>

                {/* The Animated Dropdown Menu */}
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <ListboxOptions className="absolute z-50 left-0 mt-2 w-48 overflow-hidden rounded-xl bg-white border border-slate-100 py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">

                        {/* "No Category" Option */}
                        <ListboxOption
                            value=""
                            className={({ active }) =>
                                `relative cursor-pointer select-none py-2 pl-10 pr-4 text-sm transition-colors ${active ? 'bg-slate-50 text-slate-900' : 'text-slate-600'
                                }`
                            }
                        >
                            {({ selected }) => (
                                <>
                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                        No Category
                                    </span>
                                    {selected && (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-900">
                                            <Check size={14} strokeWidth={3} />
                                        </span>
                                    )}
                                </>
                            )}
                        </ListboxOption>

                        {/* Render Actual Categories */}
                        {categories.map((category) => (
                            <ListboxOption
                                key={category.id}
                                value={category.id}
                                className={({ active }) =>
                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 text-sm transition-colors ${active ? 'bg-slate-50 text-slate-900' : 'text-slate-600'
                                    }`
                                }
                            >
                                {({ selected }) => (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: category.color }}
                                            />
                                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                {category.name}
                                            </span>
                                        </div>
                                        {selected && (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-900">
                                                <Check size={14} strokeWidth={3} />
                                            </span>
                                        )}
                                    </>
                                )}
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </Transition>
            </div>
        </Listbox>
    );
});