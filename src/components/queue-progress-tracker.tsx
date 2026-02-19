import type { ServiceProgress } from '@/types/waiting-list.types';
import { IconCheck, IconClock, IconLoader } from '@tabler/icons-react';

interface QueueProgressTrackerProps {
    progress: ServiceProgress;
}

export function QueueProgressTracker({ progress }: QueueProgressTrackerProps) {
    const steps = [
        { key: 'waiting', label: 'Waiting', icon: IconClock },
        { key: 'called', label: 'Called', icon: IconLoader },
        { key: 'in_service', label: 'In Service', icon: IconLoader },
        { key: 'completed', label: 'Completed', icon: IconCheck },
    ];

    const statusOrder = ['waiting', 'called', 'in_service', 'completed'];
    const currentIndex = statusOrder.indexOf(progress.status);

    return (
        <div className="w-full space-y-4">
            {/* Queue Header */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Queue #{progress.queue_number} Progress</h4>
                <span className="text-xs text-muted-foreground">
                    {new Date(progress.service_date).toLocaleDateString()}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="relative">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index <= currentIndex;
                        const isCurrent = index === currentIndex;

                        return (
                            <div key={step.key} className="flex flex-1 flex-col items-center">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${isActive
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-muted bg-background text-muted-foreground'
                                        } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                                >
                                    <Icon size={20} />
                                </div>
                                <p className={`mt-2 text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {step.label}
                                </p>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`absolute top-5 h-0.5 ${index < currentIndex ? 'bg-primary' : 'bg-muted'
                                            }`}
                                        style={{
                                            left: `${(index / (steps.length - 1)) * 100 + 100 / (steps.length - 1) / 2}%`,
                                            width: `${100 / (steps.length - 1)}%`,
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Queue Info */}
            {progress.status === 'waiting' && (
                <div className="rounded-md bg-muted p-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-muted-foreground">Position in Queue</p>
                            <p className="text-2xl font-bold">#{progress.position_in_queue}</p>
                        </div>
                        {progress.people_ahead > 0 && (
                            <div>
                                <p className="text-muted-foreground">People Ahead</p>
                                <p className="text-2xl font-bold">{progress.people_ahead}</p>
                            </div>
                        )}
                    </div>
                    {progress.estimated_wait_time > 0 && (
                        <div className="mt-3">
                            <p className="text-muted-foreground">Estimated Wait Time</p>
                            <p className="text-lg font-semibold">~{progress.estimated_wait_time} minutes</p>
                        </div>
                    )}
                </div>
            )}

            {progress.status === 'called' && (
                <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-4 text-sm">
                    <p className="font-semibold">Your turn! Please proceed to the service area.</p>
                </div>
            )}

            {progress.status === 'in_service' && (
                <div className="rounded-md bg-green-50 dark:bg-green-950 p-4 text-sm">
                    <p className="font-semibold">Service in progress...</p>
                    {progress.mechanic_name && (
                        <p className="mt-1 text-muted-foreground">Mechanic: {progress.mechanic_name}</p>
                    )}
                </div>
            )}

            {progress.status === 'completed' && (
                <div className="rounded-md bg-green-50 dark:bg-green-950 p-4 text-sm">
                    <p className="font-semibold text-green-700 dark:text-green-300">Service completed!</p>
                </div>
            )}
        </div>
    );
}
