import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <div 
      className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${encodeURI("https://images.unsplash.com/photo-1557804483-ef3ae78eca57")})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Ace Your Next Interview
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Master both technical and behavioral interviews with AI-powered practice
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/technical">
            <Card className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-primary/20">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Technical Interview</h2>
                <p className="text-gray-600">Challenge yourself with AI-generated technical questions and get instant feedback</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/behavioral">
            <Card className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-primary/20">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Behavioral Interview</h2>
                <p className="text-gray-600">Perfect your interview skills with real-world scenarios and AI-powered feedback</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}