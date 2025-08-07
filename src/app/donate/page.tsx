'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function DonatePage() {
  const upiId = "your-upi-id@bank";
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId).then(() => {
      toast({
        title: "Copied!",
        description: "The UPI ID has been copied to your clipboard.",
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Could not copy the UPI ID. Please try again.",
      });
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <Heart className="h-10 w-10 mx-auto text-primary mb-2" />
          <CardTitle className="text-3xl font-bold font-headline">Support Feline Finder</CardTitle>
          <CardDescription>
            Donate if you can, to keep the servers running.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="p-4 border rounded-lg">
            <Image
              src="https://placehold.co/256x256.png"
              alt="QR Code for UPI"
              width={256}
              height={256}
              className="object-contain"
              data-ai-hint="qr code"
            />
          </div>
          <div className="text-center w-full">
            <p className="text-sm text-muted-foreground mb-2">Or use UPI ID:</p>
            <div className="flex items-center justify-center gap-2 p-2 rounded-md bg-muted">
                <span className="font-mono text-lg ">{upiId}</span>
                <Button variant="ghost" size="icon" onClick={handleCopy} aria-label="Copy UPI ID">
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
