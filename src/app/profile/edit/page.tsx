
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditProfileForm } from "@/components/EditProfileForm";
import { User } from "lucide-react";

export default function EditProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
                <User className="h-10 w-10 mx-auto text-accent mb-2" />
                <CardTitle className="text-3xl font-bold font-headline">Edit Your Profile</CardTitle>
                <CardDescription>
                    Update your personal information and social links.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <EditProfileForm />
            </CardContent>
        </Card>
    </div>
  );
}
