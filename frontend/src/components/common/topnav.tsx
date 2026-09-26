import { ThemeToggle } from '@/components/theme-toggle';

export default function TopNavSection() {
    return (
        <header className="flex w-full justify-end p-4">
            <ThemeToggle />
        </header>
    );
}