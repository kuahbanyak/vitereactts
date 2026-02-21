import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { waitingListService, vehicleService, serviceItemService } from '@/services/waiting-list.service';
import type { Vehicle, TakeQueuePayload, ServiceItem, QueueAvailability } from '@/types/waiting-list.types';
import { IconSearch, IconClock, IconCurrencyDollar, IconX, IconAlertCircle, IconCircleCheck, IconCircleX, IconRefresh } from '@tabler/icons-react';
import { toast } from 'sonner';

interface QueueTicketFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

// ── Service Type Autocomplete ────────────────────────────────────────────────
interface ServiceTypeInputProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (item: ServiceItem) => void;
    serviceItems: ServiceItem[];
}

function ServiceTypeInput({ value, onChange, onSelect, serviceItems }: ServiceTypeInputProps) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const filtered = value.trim().length === 0
        ? serviceItems                       // show all when empty / focused
        : serviceItems.filter(item =>
            item.name.toLowerCase().includes(value.toLowerCase()) ||
            item.category.toLowerCase().includes(value.toLowerCase())
        );

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative">
                <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                    id="serviceType"
                    value={value}
                    onChange={e => { onChange(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    placeholder="Search or type service (e.g. Oil Change)"
                    className="pl-9 pr-8"
                    autoComplete="off"
                    required
                />
                {value && (
                    <button
                        type="button"
                        onClick={() => { onChange(''); setOpen(true); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <IconX size={14} />
                    </button>
                )}
            </div>

            {/* Dropdown suggestions */}
            {open && filtered.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-56 overflow-y-auto">
                    {filtered.map(item => (
                        <button
                            key={item.id}
                            type="button"
                            className="flex w-full items-start justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                            onMouseDown={e => {
                                e.preventDefault(); // prevent blur before click
                                onSelect(item);
                                setOpen(false);
                            }}
                        >
                            <div className="min-w-0">
                                <p className="font-medium">{item.name}</p>
                                {item.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <Badge variant="outline" className="text-xs">{item.category}</Badge>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {item.estimated_time > 0 && (
                                        <span className="flex items-center gap-0.5">
                                            <IconClock size={11} /> {item.estimated_time}m
                                        </span>
                                    )}
                                    {item.estimated_cost > 0 && (
                                        <span className="flex items-center gap-0.5">
                                            <IconCurrencyDollar size={11} /> {item.estimated_cost.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                    {/* Allow free text note */}
                    {value && !serviceItems.some(i => i.name.toLowerCase() === value.toLowerCase()) && (
                        <div className="border-t px-3 py-2 text-xs text-muted-foreground italic">
                            Press Enter or continue typing to use "{value}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Availability Banner ────────────────────────────────────────────────────────
function AvailabilityBanner({ avail, checking }: { avail: QueueAvailability | null; checking: boolean }) {
    if (checking) {
        return (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                <IconRefresh size={14} className="animate-spin shrink-0" />
                Checking availability…
            </div>
        );
    }
    if (!avail) return null;

    const canBook = avail.accepting_bookings && avail.available;
    const isSystemOff = !avail.system_active;

    const containerCls = canBook
        ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300'
        : isSystemOff
            ? 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300'
            : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300';
    const Icon = canBook ? IconCircleCheck : isSystemOff ? IconAlertCircle : IconCircleX;

    return (
        <div className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm ${containerCls}`}>
            <Icon size={16} className="shrink-0 mt-0.5" />
            <div className="min-w-0">
                <p className="font-medium leading-snug">{avail.message}</p>
                {canBook && (
                    <p className="text-xs mt-0.5 opacity-75">
                        Week: {new Date(avail.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
                        {new Date(avail.week_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' · '}{avail.remaining_tickets} / {avail.max_tickets_per_week} tickets left
                    </p>
                )}
            </div>
        </div>
    );
}

// ── Main Form ────────────────────────────────────────────────────────────────
export function QueueTicketForm({ open, onOpenChange, onSuccess }: QueueTicketFormProps) {
    const [loading, setLoading] = useState(false);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
    const [vehicleMode, setVehicleMode] = useState<'existing' | 'new'>('existing');

    // Selected service item id (sent to API as service_item_id)
    const [selectedServiceItemId, setSelectedServiceItemId] = useState<string | undefined>(undefined);

    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [newVehicle, setNewVehicle] = useState({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        license_plate: '',
        vin: '',
        mileage: 0,
        color: '',
    });

    const [serviceType, setServiceType] = useState('');
    const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    // Availability state
    const [availability, setAvailability] = useState<QueueAvailability | null>(null);
    const [checkingAvail, setCheckingAvail] = useState(false);

    const checkAvailability = useCallback(async (date: string) => {
        setCheckingAvail(true);
        try {
            const data = await waitingListService.checkAvailability(date);
            setAvailability(data);
        } catch {
            setAvailability(null);
        } finally {
            setCheckingAvail(false);
        }
    }, []);

    useEffect(() => {
        if (open) {
            loadVehicles();
            loadServiceItems();
            checkAvailability(serviceDate);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const loadVehicles = async () => {
        try {
            const data = await vehicleService.getMyVehicles();
            setVehicles(data);
            if (data.length > 0) {
                setVehicleMode('existing');
                setSelectedVehicleId(data[0].id);
            } else {
                setVehicleMode('new');
            }
        } catch {
            setVehicleMode('new');
        }
    };

    const loadServiceItems = async () => {
        const items = await serviceItemService.getServiceItems();
        setServiceItems(items);
    };

    const handleServiceItemSelect = (item: ServiceItem) => {
        setServiceType(item.name);
        setSelectedServiceItemId(item.id);
    };

    const handleServiceTypeChange = (value: string) => {
        setServiceType(value);
        // Clear service_item_id if user manually edits the text
        if (selectedServiceItemId) setSelectedServiceItemId(undefined);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload: TakeQueuePayload = {
                service_type: serviceType,
                service_date: serviceDate,
                notes: notes || undefined,
                service_item_id: selectedServiceItemId,
            };

            if (vehicleMode === 'existing') {
                if (!selectedVehicleId) {
                    toast.error('Please select a vehicle');
                    setLoading(false);
                    return;
                }
                payload.vehicle_id = selectedVehicleId;
            } else {
                if (!newVehicle.brand || !newVehicle.model || !newVehicle.license_plate) {
                    toast.error('Please fill in all required vehicle fields');
                    setLoading(false);
                    return;
                }
                payload.new_vehicle = {
                    ...newVehicle,
                    vin: newVehicle.vin || undefined,
                    mileage: newVehicle.mileage || undefined,
                    color: newVehicle.color || undefined,
                };
            }

            await waitingListService.takeQueue(payload);
            onOpenChange(false);
            resetForm();
            onSuccess?.();
        } catch {
            // error toast handled by service
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedVehicleId('');
        setSelectedServiceItemId(undefined);
        setNewVehicle({
            brand: '',
            model: '',
            year: new Date().getFullYear(),
            license_plate: '',
            vin: '',
            mileage: 0,
            color: '',
        });
        setServiceType('');
        setServiceDate(new Date().toISOString().split('T')[0]);
        setNotes('');
    };

    // Metadata of the currently linked service item
    const selectedItem = serviceItems.find(i => i.id === selectedServiceItemId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Take Queue Ticket</DialogTitle>
                    <DialogDescription>Fill in the details to get your queue number.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Vehicle Selection */}
                    <div className="space-y-3">
                        <Label>Vehicle</Label>
                        {vehicles.length > 0 && (
                            <RadioGroup value={vehicleMode} onValueChange={(v) => setVehicleMode(v as 'existing' | 'new')}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="existing" id="existing" />
                                    <Label htmlFor="existing" className="font-normal">Use existing vehicle</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="new" id="new" />
                                    <Label htmlFor="new" className="font-normal">Add new vehicle</Label>
                                </div>
                            </RadioGroup>
                        )}

                        {vehicleMode === 'existing' && vehicles.length > 0 ? (
                            <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a vehicle" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vehicles.map((vehicle) => (
                                        <SelectItem key={vehicle.id} value={vehicle.id}>
                                            {vehicle.brand} {vehicle.model} ({vehicle.year}) - {vehicle.license_plate}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="brand">Brand *</Label>
                                    <Input id="brand" value={newVehicle.brand} onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })} placeholder="Toyota" required />
                                </div>
                                <div>
                                    <Label htmlFor="model">Model *</Label>
                                    <Input id="model" value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} placeholder="Camry" required />
                                </div>
                                <div>
                                    <Label htmlFor="year">Year *</Label>
                                    <Input id="year" type="number" value={newVehicle.year} onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })} min="1900" max={new Date().getFullYear() + 1} required />
                                </div>
                                <div>
                                    <Label htmlFor="license_plate">License Plate *</Label>
                                    <Input id="license_plate" value={newVehicle.license_plate} onChange={(e) => setNewVehicle({ ...newVehicle, license_plate: e.target.value })} placeholder="ABC-1234" required />
                                </div>
                                <div>
                                    <Label htmlFor="vin">VIN (Optional)</Label>
                                    <Input id="vin" value={newVehicle.vin} onChange={(e) => setNewVehicle({ ...newVehicle, vin: e.target.value })} placeholder="1234567890ABCDEFG" />
                                </div>
                                <div>
                                    <Label htmlFor="color">Color (Optional)</Label>
                                    <Input id="color" value={newVehicle.color} onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })} placeholder="Silver" />
                                </div>
                                <div>
                                    <Label htmlFor="mileage">Mileage (Optional)</Label>
                                    <Input id="mileage" type="number" value={newVehicle.mileage} onChange={(e) => setNewVehicle({ ...newVehicle, mileage: parseInt(e.target.value) })} min="0" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Service Type with Autocomplete */}
                    <div className="space-y-2">
                        <Label htmlFor="serviceType">Service Type *</Label>
                        <ServiceTypeInput
                            value={serviceType}
                            onChange={handleServiceTypeChange}
                            onSelect={handleServiceItemSelect}
                            serviceItems={serviceItems}
                        />
                        {/* Info strip when a service item is selected */}
                        {selectedItem && (
                            <div className="flex flex-wrap items-center gap-3 rounded-md bg-muted/60 px-3 py-2 text-sm">
                                <Badge variant="secondary" className="text-xs">{selectedItem.category}</Badge>
                                {selectedItem.estimated_time > 0 && (
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                        <IconClock size={13} /> ~{selectedItem.estimated_time} min
                                    </span>
                                )}
                                {selectedItem.estimated_cost > 0 && (
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                        <IconCurrencyDollar size={13} /> {selectedItem.estimated_cost.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Service Date */}
                    <div className="space-y-2">
                        <Label htmlFor="serviceDate">Service Date *</Label>
                        <Input
                            id="serviceDate"
                            type="date"
                            value={serviceDate}
                            onChange={(e) => {
                                setServiceDate(e.target.value);
                                checkAvailability(e.target.value);
                            }}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                        <AvailabilityBanner avail={availability} checking={checkingAvail} />
                    </div>

                    {/* Notes */}
                    <div>
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any specific issues or requests..."
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !serviceType || checkingAvail || (availability !== null && !availability.accepting_bookings)}
                        >
                            {loading ? 'Creating...' : 'Take Queue'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
