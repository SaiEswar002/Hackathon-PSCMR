import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    FolderKanban,
    MessageSquare,
    Sparkles,
    Target,
    TrendingUp,
    ArrowRight,
    CheckCircle2,
    Zap,
    Globe,
} from "lucide-react";

export default function Landing() {
    const features = [
        {
            icon: Users,
            title: "Smart Skill Matching",
            description: "Connect with students who have the skills you want to learn and share your expertise with others.",
            gradient: "from-purple-500 to-blue-500",
        },
        {
            icon: FolderKanban,
            title: "Project Collaboration",
            description: "Find teammates for your projects and collaborate on exciting initiatives together.",
            gradient: "from-blue-500 to-cyan-500",
        },
        {
            icon: MessageSquare,
            title: "Real-time Messaging",
            description: "Chat instantly with your connections and build meaningful professional relationships.",
            gradient: "from-cyan-500 to-teal-500",
        },
        {
            icon: Target,
            title: "Goal Tracking",
            description: "Set learning goals and track your progress as you develop new skills.",
            gradient: "from-teal-500 to-green-500",
        },
        {
            icon: TrendingUp,
            title: "Skill Analytics",
            description: "Visualize your skill development journey with detailed analytics and insights.",
            gradient: "from-green-500 to-emerald-500",
        },
        {
            icon: Globe,
            title: "Community Network",
            description: "Join a vibrant community of learners and experts across various domains.",
            gradient: "from-emerald-500 to-purple-500",
        },
    ];

    const benefits = [
        "Find study partners and project collaborators instantly",
        "Share your knowledge and learn from peers",
        "Build your professional network early",
        "Discover opportunities that match your skills",
        "Track your learning journey and achievements",
        "Connect with mentors and industry professionals",
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

                <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
                    <div className="text-center space-y-8">
                        {/* Badge */}
                        <div className="flex justify-center animate-fade-in">
                            <Badge className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Student Skill Matchmaking Platform
                            </Badge>
                        </div>

                        {/* Headline */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight animate-fade-in-up">
                            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                Connect. Collaborate.
                            </span>
                            <br />
                            <span className="text-foreground">Grow Together.</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="max-w-2xl mx-auto text-xl sm:text-2xl text-muted-foreground animate-fade-in-up animation-delay-100">
                            Join the premier platform where students discover peers, share skills, and collaborate on projects that matter.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-200">
                            <Link href="/signup">
                                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 group">
                                    Get Started Free
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 hover:bg-accent">
                                    Sign In
                                </Button>
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-12 animate-fade-in-up animation-delay-300">
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    1000+
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">Active Students</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                    500+
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">Skills Shared</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                                    200+
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">Projects Created</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 sm:py-32 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                            Everything You Need to{" "}
                            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Succeed
                            </span>
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Powerful features designed to help you connect, learn, and grow with your peers.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <Card
                                    key={index}
                                    className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 overflow-hidden"
                                >
                                    <CardContent className="p-6 space-y-4">
                                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-semibold">{feature.title}</h3>
                                        <p className="text-muted-foreground">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 sm:py-32">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium">
                                <Zap className="w-4 h-4" />
                                Why Choose SSM?
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                                Your Gateway to{" "}
                                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    Academic Excellence
                                </span>
                            </h2>
                            <p className="text-xl text-muted-foreground">
                                SSM is more than just a platform—it's a community of ambitious students helping each other succeed.
                            </p>
                            <div className="space-y-3 pt-4">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                                        <span className="text-lg">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl blur-3xl" />
                            <Card className="relative border-2 shadow-2xl">
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl">
                                                S
                                            </div>
                                            <div>
                                                <div className="font-semibold text-lg">Student Skill Matchmaking</div>
                                                <div className="text-sm text-muted-foreground">Your Learning Companion</div>
                                            </div>
                                        </div>
                                        <div className="h-px bg-border" />
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">Profile Completion</span>
                                                <span className="font-semibold">100%</span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full w-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-4">
                                            <div className="text-center p-4 rounded-lg bg-muted">
                                                <div className="text-2xl font-bold text-purple-600">15</div>
                                                <div className="text-sm text-muted-foreground">Connections</div>
                                            </div>
                                            <div className="text-center p-4 rounded-lg bg-muted">
                                                <div className="text-2xl font-bold text-blue-600">8</div>
                                                <div className="text-sm text-muted-foreground">Projects</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-20 sm:py-32 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 text-white">
                <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-xl opacity-90">
                        Join thousands of students who are already growing their skills and building their future.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/signup">
                            <Button size="lg" className="text-lg px-8 py-6 bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group">
                                Create Free Account
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                    <p className="text-sm opacity-75">
                        No credit card required • Free forever • Join in 30 seconds
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-muted/30 border-t">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                                S
                            </div>
                            <span className="font-semibold text-lg">SSM Platform</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2025 Student Skill Matchmaking. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
