import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

export default function DonatePage() {
  const upiId = "your-upi-id@bank";

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
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Or use UPI ID:</p>
            <div className="font-mono text-lg bg-muted p-2 rounded-md">
              {upiId}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
