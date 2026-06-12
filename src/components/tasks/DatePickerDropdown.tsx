import { Fragment } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Transition } from '@headlessui/react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format, parse } from 'date-fns';

interface DatePickerDropdownProps {
    selectedDate: string;
    onChange: (date: string) => void;
}

export function DatePickerDropdown({ selectedDate, onChange }: DatePickerDropdownProps) {
    // Convert the string "YYYY-MM-DD" to a Date object for the calendar
    const parsedDate = selectedDate ? parse(selectedDate, 'yyyy-MM-dd', new Date()) : undefined;

    const handleSelect = (date: Date | undefined) => {
        // Convert back to string for your parent state, or empty string if cleared
        onChange(date ? format(date, 'yyyy-MM-dd') : '');
    };

    return (
        <Popover className="relative z-20">
            {({ close }) => (
                <>
                    <PopoverButton className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm text-slate-600 hover:bg-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                        <CalendarIcon size={14} className="text-slate-400" />
                        <span>
                            {parsedDate ? format(parsedDate, 'MMM d, yyyy') : "No Date"}
                        </span>
                    </PopoverButton>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <PopoverPanel className="absolute z-50 left-0 mt-2 p-3 bg-white border border-slate-100 rounded-xl shadow-lg ring-1 ring-black/5 focus:outline-none">
                            <DayPicker
                                mode="single"
                                selected={parsedDate}
                                onSelect={(date) => {
                                    handleSelect(date);
                                    if (date) close(); // Auto-close when a date is selected
                                }}
                                showOutsideDays
                                className="p-0"
                                classNames={{
                                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                    month: "space-y-4",
                                    month_caption: "flex justify-center pt-1 relative items-center",
                                    caption_label: "text-sm font-medium text-slate-900",
                                    nav: "space-x-1 flex items-center",
                                    button_previous: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors absolute left-1",
                                    button_next: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors absolute right-1",
                                    month_grid: "w-full border-collapse space-y-1",
                                    weekdays: "flex",
                                    weekday: "text-slate-500 rounded-md w-8 font-normal text-[0.8rem]",
                                    week: "flex w-full mt-2",
                                    day: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                    day_button: "h-8 w-8 p-0 font-normal rounded-md aria-selected:opacity-100 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer",
                                    selected: "bg-slate-900 text-white hover:bg-slate-900 hover:text-white focus:bg-slate-900 focus:text-white",
                                    today: "bg-slate-100 text-slate-900",
                                    outside: "text-slate-400 opacity-50",
                                    disabled: "text-slate-400 opacity-50",
                                    hidden: "invisible",
                                }}
                                components={{
                                    Chevron: (props) => {
                                        if (props.orientation === "left") {
                                            return <ChevronLeft className={`h-4 w-4 ${props.className || ""}`} />;
                                        }
                                        return <ChevronRight className={`h-4 w-4 ${props.className || ""}`} />;
                                    },
                                }}
                            />
                        </PopoverPanel>
                    </Transition>
                </>
            )}
        </Popover>
    );
}