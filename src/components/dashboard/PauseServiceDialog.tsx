import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface PauseServiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (startDate: string, endDate: string) => void;
}

export function PauseServiceDialog({ open, onOpenChange, onConfirm }: PauseServiceDialogProps) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleConfirm = () => {
        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            alert("End date cannot be before start date.");
            return;
        }

        onConfirm(startDate, endDate);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Schedule Pause</DialogTitle>
                    <DialogDescription>
                        Set a date range during which you will be unavailable. You will automatically resume your services after the end date.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Start Date</label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">End Date</label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate || new Date().toISOString().split("T")[0]}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleConfirm} className="bg-orange-600 hover:bg-orange-700 text-white">
                        Confirm Pause
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
