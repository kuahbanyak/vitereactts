import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { waitingListService, vehicleService } from '@/services/waiting-list.service';
import type { Vehicle, TakeQueuePayload } from '@/types/waiting-list.types';
import { toast } from 'sonner';

interface QueueTicketFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function QueueTicketForm({ open, onOpenChange, onSuccess }: QueueTicketFormProps) {
    const [loading, setLoading] = useState(false);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [vehicleMode, setVehicleMode] = useState<'existing' | 'new'>('existing');

    // Form state for existing vehicle
    const [selectedVehicleId, setSelectedVehicleId] = useState('');

    // Form state for new vehicle
    const [newVehicle, setNewVehicle] = useState({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        license_plate: '',
        vin: '',
        mileage: 0,
        color: '',
    });

    // Form state for service
    const [serviceType, setServiceType] = useState('');
    const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (open) {
            loadVehicles();
        }
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
        } catch (error) {
            console.error('Failed to load vehicles:', error);
            setVehicleMode('new');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload: TakeQueuePayload = {
                service_type: serviceType,
                service_date: serviceDate,
                notes: notes || undefined,
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
        } catch (error) {
            console.error('Failed to take queue:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedVehicleId('');
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
                                    <Input
                                        id="brand"
                                        value={newVehicle.brand}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                                        placeholder="Toyota"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="model">Model *</Label>
                                    <Input
                                        id="model"
                                        value={newVehicle.model}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                                        placeholder="Camry"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="year">Year *</Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        value={newVehicle.year}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                                        min="1900"
                                        max={new Date().getFullYear() + 1}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="license_plate">License Plate *</Label>
                                    <Input
                                        id="license_plate"
                                        value={newVehicle.license_plate}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, license_plate: e.target.value })}
                                        placeholder="ABC-1234"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="vin">VIN (Optional)</Label>
                                    <Input
                                        id="vin"
                                        value={newVehicle.vin}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, vin: e.target.value })}
                                        placeholder="1234567890ABCDEFG"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="color">Color (Optional)</Label>
                                    <Input
                                        id="color"
                                        value={newVehicle.color}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                                        placeholder="Silver"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="mileage">Mileage (Optional)</Label>
                                    <Input
                                        id="mileage"
                                        type="number"
                                        value={newVehicle.mileage}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, mileage: parseInt(e.target.value) })}
                                        min="0"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Service Details */}
                    <div className="space-y-3">
                        <div>
                            <Label htmlFor="serviceType">Service Type *</Label>
                            <Input
                                id="serviceType"
                                value={serviceType}
                                onChange={(e) => setServiceType(e.target.value)}
                                placeholder="Oil Change, Brake Inspection, etc."
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="serviceDate">Service Date *</Label>
                            <Input
                                id="serviceDate"
                                type="date"
                                value={serviceDate}
                                onChange={(e) => setServiceDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>

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
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Take Queue'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
