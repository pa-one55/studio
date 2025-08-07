
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench } from 'lucide-react';
import Link from 'next/link';

export default function ComingSoonPage() {
  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <Wrench className="h-12 w-12 mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl font-bold font-headline">Coming Soon!</CardTitle>
          <CardDescription>
            This feature is currently under construction. We're working hard to bring it to you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/">
              Go Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
