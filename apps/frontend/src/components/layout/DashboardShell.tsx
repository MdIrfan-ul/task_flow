"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import CreateProjectModal from "../projects/CreateProjectModal";

interface DashboardShellProps {
    children: ReactNode;
    user: {
        name: string;
        role: string;
        avatarUrl?: string | null;
    };
}

export default function DashboardShell({ children, user }: DashboardShellProps) {
    const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar onNewProject={() => setIsCreateProjectOpen(true)} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto scrollbar-thin px-8 py-6">
                    {children}
                </main>
            </div>

            <CreateProjectModal
                isOpen={isCreateProjectOpen}
                onClose={() => setIsCreateProjectOpen(false)}
            />
        </div>
    );
}

// "use client";

// import { ReactNode } from "react";
// import Sidebar from "./Sidebar";
// import Header from "./Header";

// interface DashboardShellProps {
//     children: ReactNode;
//     user: {
//         name: string;
//         role: string;
//         avatarUrl?: string | null;
//     };
// }

// export default function DashboardShell({ children, user }: DashboardShellProps) {
//     return (
//         <div className="flex h-screen overflow-hidden bg-background">
//             <Sidebar />
//             <div className="flex-1 flex flex-col overflow-hidden">
//                 <Header user={user} />
//                 <main className="flex-1 overflow-y-auto scrollbar-thin px-8 py-6">
//                     {children}
//                 </main>
//             </div>
//         </div>
//     );
// }