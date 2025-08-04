import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <Image
              src="https://placehold.co/200x200.png"
              alt="Your Name"
              width={128}
              height={128}
              className="rounded-full object-cover shadow-lg"
              data-ai-hint="person face"
            />
          </div>
          <CardTitle className="text-3xl font-bold font-headline">Your Name</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            A brief bio about yourself. For example: I'm a passionate developer who loves cats and building helpful applications.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline" size="icon">
              <Link href="#" target="_blank" rel="noopener noreferrer">
                <Twitter />
                <span className="sr-only">Twitter</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="icon">
              <Link href="#" target="_blank" rel="noopener noreferrer">
                <Github />
                <span className="sr-only">GitHub</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="icon">
              <Link href="#" target="_blank" rel="noopener noreferrer">
                <Linkedin />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
