import { useState } from "react";
import { InterviewLayout } from "@/components/InterviewLayout";
import { QuestionCard } from "@/components/QuestionCard";
import { useGenerateBehavioralQuestion, useAnalyzeBehavioralAnswer } from "@/lib/interview";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Mic, MicOff, Check, X, RotateCcw, Gauge, Volume2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Answer {
  question: string;
  answer: string;
  analysis?: {
    strengths: string[];
    improvements: string[];
    betterAnswer: string;
    score: number;
    toneAnalysis: {
      confidence: number;
      clarity: number;
      professionalism: number;
      enthusiasm: number;
      observations: string[];
    };
  };
}

export default function BehavioralInterview() {
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const { toast } = useToast();

  const generateQuestion = useGenerateBehavioralQuestion();
  const analyzeAnswer = useAnalyzeBehavioralAnswer();

  const handleStart = async () => {
    try {
      const question = await generateQuestion.mutateAsync(questions);
      setCurrentQuestion(question);
      setCurrentAnswer("");
      setShowAnalysis(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate question",
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = async () => {
    if (!currentAnswer.trim()) {
      toast({
        title: "Error",
        description: "Please provide an answer before analyzing",
        variant: "destructive",
      });
      return;
    }

    try {
      const analysis = await analyzeAnswer.mutateAsync({
        question: currentQuestion.question,
        answer: currentAnswer,
      });

      setAnswers([
        ...answers,
        {
          question: currentQuestion.question,
          answer: currentAnswer,
          analysis,
        },
      ]);
      setShowAnalysis(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze answer",
        variant: "destructive",
      });
    }
  };

  const handleNext = async () => {
    if (currentQuestion) {
      setQuestions([...questions, currentQuestion.question]);
    }
    await handleStart();
  };

  const startRecording = async () => {
    try {
      const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
        toast({
          title: "Recording started",
          description: "Speak your answer...",
        });
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join(" ");
        setCurrentAnswer(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        toast({
          title: "Error",
          description: "Failed to record speech. Please try again.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Speech recognition error:', error);
      toast({
        title: "Error",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    const recognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
  };

  return (
    <InterviewLayout title="Behavioral Interview">
      {!currentQuestion ? (
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl font-semibold mb-4">Ready to start your behavioral interview?</h2>
          <p className="text-muted-foreground mb-6">
            You'll be asked a series of behavioral questions. Take your time to think and respond thoughtfully.
            You can either type your answer or use voice input. Our AI will analyze both your content and communication style.
          </p>
          <Button onClick={handleStart} disabled={generateQuestion.isPending}>
            Start Interview
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <QuestionCard
            question={currentQuestion.question}
            explanation={currentQuestion.context}
          />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Textarea
                placeholder="Type your answer here or click the microphone to speak..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                className="min-h-[200px]"
              />
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                className="flex-shrink-0"
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
            </div>

            {!showAnalysis ? (
              <div className="flex justify-end gap-2">
                <Button onClick={handleAnalyze} disabled={analyzeAnswer.isPending || !currentAnswer.trim()}>
                  Analyze Answer
                </Button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {answers.length > 0 && answers[answers.length - 1].analysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        Analysis Score: {answers[answers.length - 1].analysis.score}%
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Content Analysis</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <h3 className="font-semibold flex items-center gap-2 text-green-600">
                                <Check className="h-5 w-5" />
                                Strengths
                              </h3>
                              <ul className="mt-2 space-y-2">
                                {answers[answers.length - 1].analysis.strengths.map((strength, index) => (
                                  <li key={index} className="text-sm text-muted-foreground">{strength}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h3 className="font-semibold flex items-center gap-2 text-amber-600">
                                <RotateCcw className="h-5 w-5" />
                                Areas for Improvement
                              </h3>
                              <ul className="mt-2 space-y-2">
                                {answers[answers.length - 1].analysis.improvements.map((improvement, index) => (
                                  <li key={index} className="text-sm text-muted-foreground">{improvement}</li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Communication Style</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Confidence</span>
                                  <span>{answers[answers.length - 1].analysis.toneAnalysis.confidence}%</span>
                                </div>
                                <Progress value={answers[answers.length - 1].analysis.toneAnalysis.confidence} />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Clarity</span>
                                  <span>{answers[answers.length - 1].analysis.toneAnalysis.clarity}%</span>
                                </div>
                                <Progress value={answers[answers.length - 1].analysis.toneAnalysis.clarity} />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Professionalism</span>
                                  <span>{answers[answers.length - 1].analysis.toneAnalysis.professionalism}%</span>
                                </div>
                                <Progress value={answers[answers.length - 1].analysis.toneAnalysis.professionalism} />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Enthusiasm</span>
                                  <span>{answers[answers.length - 1].analysis.toneAnalysis.enthusiasm}%</span>
                                </div>
                                <Progress value={answers[answers.length - 1].analysis.toneAnalysis.enthusiasm} />
                              </div>
                            </div>

                            <div>
                              <h3 className="font-semibold flex items-center gap-2">
                                <Volume2 className="h-5 w-5" />
                                Tone Observations
                              </h3>
                              <ul className="mt-2 space-y-2">
                                {answers[answers.length - 1].analysis.toneAnalysis.observations.map((observation, index) => (
                                  <li key={index} className="text-sm text-muted-foreground">{observation}</li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Sample Better Answer</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {answers[answers.length - 1].analysis.betterAnswer}
                          </p>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end">
                  <Button onClick={handleNext} disabled={generateQuestion.isPending}>
                    Next Question
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </InterviewLayout>
  );
}