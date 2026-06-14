import { Fragment, useMemo } from 'react';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption, Transition } from '@headlessui/react';
import { Clock, Check } from 'lucide-react';

interface TimePickerDropdownProps {
    selectedTime: string;
    onChange: (time: string) => void;
}

export function TimePickerDropdown({ selectedTime, onChange }: TimePickerDropdownProps) {
    const times = useMemo(() => {
        const list = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 30) {
                const hh = String(h).padStart(2, '0');
                const mm = String(m).padStart(2, '0');
                list.push(`${hh}:${mm}`);
            }
        }
        return list;
    }, []);

    return (
        <Listbox value={selectedTime} onChange={onChange}>
            <div className="relative">
                <ListboxButton className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm text-slate-600 hover:bg-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                    <Clock size={14} className="text-slate-400" />
                    <span>{selectedTime || "No Time"}</span>
                </ListboxButton>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <ListboxOptions className="z-50 absolute left-0 mt-2 w-32 bg-white border border-slate-100 rounded-xl shadow-lg max-h-60 overflow-auto focus:outline-none">
                        {times.map((time) => (
                            <ListboxOption
                                key={time}
                                value={time}
                                className={({ active }) =>
                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 text-sm ${active ? 'bg-slate-100 text-slate-900' : 'text-slate-700'}`
                                }
                            >
                                {({ selected }) => (
                                    <>
                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                            {time}
                                        </span>
                                        {selected ? (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600">
                                                <Check className="h-4 w-4" />
                                            </span>
                                        ) : null}
                                    </>
                                )}
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </Transition>
            </div>
        </Listbox>
    );
}