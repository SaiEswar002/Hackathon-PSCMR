import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminUsers() {
    const { data: users, isLoading } = useQuery({
        queryKey: ["admin-users"],
        queryFn: async () => {
            const response = await fetch("/api/users");
            if (!response.ok) throw new Error("Failed to fetch users");
            return response.json();
        },
    });

    if (isLoading) {
        return <div className="p-8">Loading users...</div>;
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">All Users in Database</h1>
            <div className="grid gap-4">
                {users?.map((user: any) => (
                    <Card key={user.id}>
                        <CardHeader>
                            <CardTitle>{user.fullName}</CardTitle>
                            <div className="text-sm text-muted-foreground">
                                {user.email} • {user.academicYear} • {user.department}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="font-semibold mb-2">Skills to Share:</p>
                                <div className="flex flex-wrap gap-2">
                                    {user.skillsToShare?.map((skill: string) => (
                                        <Badge key={skill} variant="secondary">{skill}</Badge>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="font-semibold mb-2">Skills to Learn:</p>
                                <div className="flex flex-wrap gap-2">
                                    {user.skillsToLearn?.map((skill: string) => (
                                        <Badge key={skill} variant="outline">{skill}</Badge>
                                    ))}
                                </div>
                            </div>
                            {user.interests?.length > 0 && (
                                <div>
                                    <p className="font-semibold mb-2">Interests:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {user.interests.map((interest: string) => (
                                            <Badge key={interest} variant="default">{interest}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                                User ID: {user.id}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
