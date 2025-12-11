import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SkillTagInput, SkillTagInputRef } from "@/components/skill-tag-input";
import { SiGoogle, SiGithub, SiLinkedin } from "react-icons/si";
import { useRef } from "react";

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  academicYear: z.string().min(1, "Please select your academic year"),
  department: z.string().min(1, "Please enter your department"),
  skillsToShare: z.array(z.string()).min(1, "Add at least one skill to share"),
  skillsToLearn: z.array(z.string()).min(1, "Add at least one skill to learn"),
  interests: z.array(z.string()),
});

type SignupForm = z.infer<typeof signupSchema>;

interface SignupProps {
  onSignup: (data: SignupForm) => void;
  isLoading?: boolean;
}

const academicYears = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Graduate",
  "PhD",
];

export default function Signup({ onSignup, isLoading }: SignupProps) {
  const skillsToShareRef = useRef<SkillTagInputRef>(null);
  const skillsToLearnRef = useRef<SkillTagInputRef>(null);
  const interestsRef = useRef<SkillTagInputRef>(null);

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      academicYear: "",
      department: "",
      skillsToShare: [],
      skillsToLearn: [],
      interests: [],
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Commit any pending input values and get the updated arrays
    const newSkillsToShare = skillsToShareRef.current?.commitPending() ?? form.getValues('skillsToShare');
    const newSkillsToLearn = skillsToLearnRef.current?.commitPending() ?? form.getValues('skillsToLearn');
    const newInterests = interestsRef.current?.commitPending() ?? form.getValues('interests');

    // Update form values synchronously
    form.setValue('skillsToShare', newSkillsToShare, { shouldValidate: true });
    form.setValue('skillsToLearn', newSkillsToLearn, { shouldValidate: true });
    form.setValue('interests', newInterests, { shouldValidate: true });

    // Trigger form validation and submission
    form.handleSubmit(onSignup)();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-8">
      <Card className="w-full max-w-lg shadow-lg">
        <div className="h-2 bg-gradient-to-r from-[#7b2ff7] to-[#4facfe] rounded-t-lg" />
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">S</span>
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Join SSM and start skill matching today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" className="w-full" data-testid="button-google-signup">
              <SiGoogle className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full" data-testid="button-github-signup">
              <SiGithub className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full" data-testid="button-linkedin-signup">
              <SiLinkedin className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="col-span-2 sm:col-span-1">
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} data-testid="input-fullname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="col-span-2 sm:col-span-1">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@university.edu" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Create a password" {...field} data-testid="input-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="academicYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Academic Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-academic-year">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {academicYears.map((year) => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="Computer Science" {...field} data-testid="input-department" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="skillsToShare"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills to Share</FormLabel>
                    <FormControl>
                      <SkillTagInput
                        ref={skillsToShareRef}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Add skills you can teach..."
                        data-testid="input-skills-share"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skillsToLearn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills to Learn</FormLabel>
                    <FormControl>
                      <SkillTagInput
                        ref={skillsToLearnRef}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Add skills you want to learn..."
                        data-testid="input-skills-learn"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interests (optional)</FormLabel>
                    <FormControl>
                      <SkillTagInput
                        ref={interestsRef}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Add your interests..."
                        data-testid="input-interests"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-signup"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline" data-testid="link-login">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
