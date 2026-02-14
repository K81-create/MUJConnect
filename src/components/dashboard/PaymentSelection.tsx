import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QrCode, Banknote } from "lucide-react";

interface PaymentSelectionProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (method: 'cod' | 'qr') => void;
    totalAmount: number;
}

export function PaymentSelection({ open, onOpenChange, onConfirm, totalAmount }: PaymentSelectionProps) {
    const [method, setMethod] = useState<'cod' | 'qr'>('qr');

    const handleConfirm = () => {
        onConfirm(method);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Select Payment Method</DialogTitle>
                    <DialogDescription>
                        Complete your booking securely. Total to pay: <span className="font-bold text-primary">₹{totalAmount}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <RadioGroup value={method} onValueChange={(v) => setMethod(v as 'cod' | 'qr')} className="grid grid-cols-2 gap-4">
                        <div>
                            <RadioGroupItem value="qr" id="qr" className="peer sr-only" />
                            <Label
                                htmlFor="qr"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                                <QrCode className="mb-3 h-6 w-6" />
                                <span className="text-sm font-medium">Scan QR</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="cod" id="cod" className="peer sr-only" />
                            <Label
                                htmlFor="cod"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                                <Banknote className="mb-3 h-6 w-6" />
                                <span className="text-sm font-medium">Cash on Delivery</span>
                            </Label>
                        </div>
                    </RadioGroup>

                    {method === 'qr' && (
                        <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-gray-50">
                            <p className="text-sm text-muted-foreground mb-4">Scan to pay via UPI</p>
                            {/* Placeholder for QR Code */}
                            <div className="w-48 h-48 bg-white p-2 rounded shadow-sm flex items-center justify-center border">
                                <img
                                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=example@upi&pn=ServiceApp&am=${totalAmount}&cu=INR"
                                    alt="Payment QR Code"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                Use any UPI app like GPay, PhonePe, Paytm
                            </p>
                        </div>
                    )}

                    {method === 'cod' && (
                        <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-yellow-50">
                            <Banknote className="h-12 w-12 text-yellow-600 mb-2" />
                            <p className="text-center font-medium text-yellow-800">
                                Pay cash/online upon service completion
                            </p>
                            <p className="text-sm text-yellow-600 text-center mt-1">
                                Please keep exact change ready if paying by cash.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="sm:justify-start">
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleConfirm} className="ml-auto">
                        Confirm Booking
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
