import { ThemeProvider } from "@/components/theme-provider"
import {ModeToggle} from "@/components/mode-toggle.tsx";

function App() {
    return (
        <ThemeProvider>
            <div className="flex h-screen w-screen items-center justify-center">
                <ModeToggle />
            </div>
        </ThemeProvider>
    )
}

export default App