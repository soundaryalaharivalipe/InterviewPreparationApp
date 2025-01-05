import { useState } from "react";
import { InterviewLayout } from "@/components/InterviewLayout";
import { QuestionCard } from "@/components/QuestionCard";
import { useGenerateTechnicalQuestion } from "@/lib/interview";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle } from "lucide-react";

interface Answer {
  question: string;
  userAnswer: number;
  correctAnswer: number;
  explanation: string;
}

const topics = [
  // Frontend
  "JavaScript", "TypeScript", "React", "Vue.js", "Angular", "HTML/CSS",
  "Web Performance", "Browser APIs", "Frontend Testing",
  // Backend
  "Node.js", "Python", "Java", "REST APIs", "GraphQL",
  "Microservices", "System Design", "API Design",
  // Databases
  "SQL", "NoSQL", "Database Design", "Query Optimization",
  // Computer Science Fundamentals
  "Data Structures", "Algorithms", "Operating Systems",
  "Computer Networks", "Design Patterns",
  // Cloud & DevOps
  "AWS", "Docker", "Kubernetes", "CI/CD", "Cloud Architecture",
  // Security
  "Web Security", "Authentication", "Encryption",
  // Mobile Development
  "React Native", "iOS", "Android",
];

const difficulties = ["Easy", "Medium", "Hard"];
const TOTAL_QUESTIONS = 10;

export default function TechnicalInterview() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const generateQuestion = useGenerateTechnicalQuestion();

  const handleStartQuiz = async () => {
    if (!topic || !difficulty) {
      toast({
        title: "Error",
        description: "Please select both topic and difficulty",
        variant: "destructive",
      });
      return;
    }

    try {
      setQuestionNumber(1);
      setAnswers([]);
      setShowResults(false);
      const question = await generateQuestion.mutateAsync({ topic, difficulty });
      setCurrentQuestion(question);
      setSelectedAnswer(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate question",
        variant: "destructive",
      });
    }
  };

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNext = async () => {
    if (currentQuestion && selectedAnswer !== null) {
      setAnswers([
        ...answers,
        {
          question: currentQuestion.question,
          userAnswer: selectedAnswer,
          correctAnswer: currentQuestion.correctAnswer,
          explanation: currentQuestion.explanation,
        },
      ]);
    }

    if (questionNumber >= TOTAL_QUESTIONS) {
      setShowResults(true);
      setCurrentQuestion(null);
      return;
    }

    try {
      const question = await generateQuestion.mutateAsync({ topic, difficulty });
      setCurrentQuestion(question);
      setSelectedAnswer(null);
      setQuestionNumber((prev) => prev + 1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate next question",
        variant: "destructive",
      });
    }
  };

  const calculateResults = () => {
    const correctAnswers = answers.filter(
      (answer) => answer.userAnswer === answer.correctAnswer
    ).length;
    const percentage = (correctAnswers / answers.length) * 100;
    return {
      total: answers.length,
      correct: correctAnswers,
      percentage: Math.round(percentage),
    };
  };

  if (showResults) {
    const results = calculateResults();
    return (
      <InterviewLayout title="Technical Interview Results">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Results</CardTitle>
              <CardDescription>
                {topic} - {difficulty} Difficulty
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Score: {results.correct} out of {results.total}
                  </span>
                  <span className="text-2xl font-bold">{results.percentage}%</span>
                </div>
                <Progress value={results.percentage} />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Question Breakdown</h3>
                {answers.map((answer, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        {answer.userAnswer === answer.correctAnswer ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        )}
                        <div className="space-y-2">
                          <p className="font-medium">{answer.question}</p>
                          <p className="text-sm text-muted-foreground">
                            {answer.explanation}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button onClick={handleStartQuiz}>Start New Quiz</Button>
          </div>
        </div>
      </InterviewLayout>
    );
  }

  return (
    <InterviewLayout title="Technical Interview">
      {!currentQuestion ? (
        <div className="max-w-md mx-auto space-y-6">
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger>
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="w-full"
            onClick={handleStartQuiz}
            disabled={generateQuestion.isPending}
          >
            Start Quiz
          </Button>
        </div>
      ) : (
        <QuestionCard
          question={currentQuestion.question}
          options={currentQuestion.options}
          onAnswer={handleAnswer}
          onNext={handleNext}
          showNext={selectedAnswer !== null}
          isCorrect={selectedAnswer === currentQuestion.correctAnswer}
          explanation={selectedAnswer !== null ? currentQuestion.explanation : undefined}
          isAnswered={selectedAnswer !== null}
          isLoading={generateQuestion.isPending}
          currentQuestion={questionNumber}
          totalQuestions={TOTAL_QUESTIONS}
        />
      )}
    </InterviewLayout>
  );
}