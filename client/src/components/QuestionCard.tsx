import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface QuestionCardProps {
  question: string;
  options?: string[];
  onAnswer?: (index: number) => void;
  onNext?: () => void;
  showNext?: boolean;
  isCorrect?: boolean;
  explanation?: string;
  isAnswered?: boolean;
  isLoading?: boolean;
  currentQuestion?: number;
  totalQuestions?: number;
}

export function QuestionCard({
  question,
  options,
  onAnswer,
  onNext,
  showNext,
  isCorrect,
  explanation,
  isAnswered,
  isLoading,
  currentQuestion,
  totalQuestions,
}: QuestionCardProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      {isLoading ? (
        <CardContent className="pt-6 min-h-[300px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating question...</p>
          </div>
        </CardContent>
      ) : (
        <>
          <CardContent className="pt-6">
            {currentQuestion !== undefined && totalQuestions !== undefined && (
              <div className="mb-4 flex items-center gap-2">
                <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestion} of {totalQuestions}
                </span>
              </div>
            )}

            <h2 className="text-xl font-semibold mb-4 whitespace-pre-wrap break-words">{question}</h2>

            {options && (
              <div className="space-y-3">
                {options.map((option, index) => (
                  <Button
                    key={index}
                    variant={isAnswered ? (isCorrect && index === onAnswer ? "default" : "outline") : "outline"}
                    className="w-full justify-start text-left h-auto py-3 px-4 whitespace-pre-wrap"
                    onClick={() => !isAnswered && onAnswer?.(index)}
                    disabled={isAnswered}
                  >
                    <span className="break-words">{option}</span>
                  </Button>
                ))}
              </div>
            )}

            <AnimatePresence>
              {isAnswered && explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mt-4 p-4 rounded-lg whitespace-pre-wrap break-words ${
                    isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {explanation}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          {showNext && (
            <CardFooter className="justify-end">
              <Button onClick={onNext}>Next Question</Button>
            </CardFooter>
          )}
        </>
      )}
    </Card>
  );
}