import type { Route } from "./+types/home";
import { Link } from "react-router";
import { BookText, Layers, Tag, Sparkles, ArrowRight, Check } from "lucide-react";
import Layout from "~/components/Layout";
import Button from "~/components/Button";
import Card from "~/components/Card";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Thoughtful - Your Personal Idea Notebook" },
    { name: "description", content: "Capture, organize, and develop your ideas with Thoughtful - a beautiful notebook app with tags, images, and more." },
  ];
}

export default function Home() {
  const features = [
    {
      icon: Layers,
      title: "Organize Your Ideas",
      description: "Keep all your thoughts structured with custom icons and visual hierarchy.",
    },
    {
      icon: Tag,
      title: "Powerful Tagging",
      description: "Tag and categorize your notes to find exactly what you need, instantly.",
    },
    {
      icon: BookText,
      title: "Rich Content",
      description: "Add descriptions, images, and detailed context to every idea.",
    },
    {
      icon: Sparkles,
      title: "Beautiful Design",
      description: "A clean, dark interface that helps you focus on what matters.",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-accent)]/10 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-24 sm:pb-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[var(--color-text-primary)] mb-6 leading-tight">
              Your Ideas,
              <br />
              <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] bg-clip-text text-transparent">
                Beautifully Organized
              </span>
            </h1>
            <p className="text-xl text-[var(--color-text-secondary)] mb-10 max-w-2xl mx-auto">
              Thoughtful is your personal idea notebook. Capture inspiration, organize with tags and icons, 
              and never lose track of your brilliant ideas again.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/notebook">
                <Button size="lg" className="group">
                  Open Your Notebook
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="secondary" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[var(--color-bg-secondary)]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Thoughtful combines simplicity with powerful features to help you manage your ideas effectively.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
              Simple & Intuitive
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Getting started with Thoughtful is easy
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-8">
            {[
              { step: 1, title: "Create a Note", description: "Click the + button to start a new idea" },
              { step: 2, title: "Add Details", description: "Give it a title, description, tags, and choose an icon" },
              { step: 3, title: "Stay Organized", description: "Find your ideas instantly with search and tags" },
            ].map((item) => (
              <div key={item.step} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[var(--color-accent)] rounded-full flex items-center justify-center text-white font-bold">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[var(--color-text-secondary)]">
                    {item.description}
                  </p>
                </div>
                <Check className="w-6 h-6 text-[var(--color-success)] flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--color-accent-light)]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-[var(--color-text-secondary)] mb-8">
            Start capturing your ideas today with Thoughtful
          </p>
          <Link to="/notebook">
            <Button size="lg" className="group">
              Open Your Notebook
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
