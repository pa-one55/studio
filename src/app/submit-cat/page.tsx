
import { SubmitCatForm } from "@/components/SubmitCatForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cat } from "lucide-react";

export default function SubmitCatPage() {
  return (
    <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
                <Cat className="h-10 w-10 mx-auto text-accent mb-2" />
                <CardTitle className="text-3xl font-bold font-headline">List a Stray Cat</CardTitle>
                <CardDescription>
                    Found a stray cat? Fill out the form below to create a listing and help it get seen.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <SubmitCatForm />
            </CardContent>
        </Card>
    </div>
  );
}
