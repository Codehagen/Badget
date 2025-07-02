"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, MessageSquare, CheckCircle } from "lucide-react";

interface WasThisHelpfulProps {
  postSlug: string;
}

export function WasThisHelpful({ postSlug }: WasThisHelpfulProps) {
  const [feedback, setFeedback] = useState<"helpful" | "not-helpful" | null>(
    null
  );
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFeedback = (type: "helpful" | "not-helpful") => {
    setFeedback(type);

    // For not helpful, show feedback form
    if (type === "not-helpful") {
      setShowFeedbackForm(true);
    } else {
      // For helpful, just track the positive feedback
      trackFeedback(type, "");
      setIsSubmitted(true);
    }
  };

  const handleSubmitFeedback = () => {
    if (feedback) {
      trackFeedback(feedback, feedbackText);
      setIsSubmitted(true);
      setShowFeedbackForm(false);
    }
  };

  const trackFeedback = (type: string, text: string) => {
    // In a real app, you'd send this to your analytics service
    console.log("Feedback tracked:", {
      postSlug,
      type,
      text,
      timestamp: new Date().toISOString(),
    });

    // Example: Track with your analytics service
    // analytics.track('Blog Post Feedback', {
    //   postSlug,
    //   feedback: type,
    //   comment: text
    // });
  };

  if (isSubmitted) {
    return (
      <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
        <CardContent className="flex items-center gap-3 py-6">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <div>
            <p className="font-medium text-green-900 dark:text-green-100">
              Thanks for your feedback!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your input helps us improve our content.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardContent className="py-6">
        {!feedback ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              <h3 className="font-medium">Was this article helpful?</h3>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback("helpful")}
                className="flex items-center gap-2 hover:bg-green-50 hover:border-green-200 hover:text-green-700 dark:hover:bg-green-950/30 dark:hover:border-green-800 dark:hover:text-green-300"
              >
                <ThumbsUp className="w-4 h-4" />
                Yes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback("not-helpful")}
                className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700 dark:hover:bg-red-950/30 dark:hover:border-red-800 dark:hover:text-red-300"
              >
                <ThumbsDown className="w-4 h-4" />
                No
              </Button>
            </div>
          </div>
        ) : showFeedbackForm ? (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium mb-2">Help us improve</h3>
              <p className="text-sm text-muted-foreground">
                What could we do better? Your feedback is valuable to us.
              </p>
            </div>
            <div className="space-y-3">
              <Textarea
                placeholder="Tell us how we can improve this article..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowFeedbackForm(false);
                    setFeedback(null);
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSubmitFeedback}>
                  Submit Feedback
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
