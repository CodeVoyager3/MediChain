import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { AnimatedThemeToggler } from "./magicui/animated-theme-toggler";

export function SiteHeader({ title = "Dashboard" }) {
  return (
    <header
      className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-20 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear bg-background/50 backdrop-blur-md sticky top-0 z-30">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-lg font-semibold flex-1">{title}</h1>
        <div className="flex items-center gap-2">
            <AnimatedThemeToggler />
        </div>
      </div>
    </header>
  );
}
