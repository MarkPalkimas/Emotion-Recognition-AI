// therapeuticHandler.js
import EmotionLearner from './emotionLearner.js';

export default class TherapeuticHandler {
  constructor() {
    this.learner = new EmotionLearner();
    this.conversationHistory = [];
    // Predefined responses for each emotion and intensity level.
    this.responses = {
      joy: {
        mild: [
          "I see you're feeling a bit cheerful today.",
          "It's nice to sense some joy in your words."
        ],
        moderate: [
          "You sound genuinely happy – that's wonderful!",
          "Your joy is infectious; keep it up!"
        ],
        severe: [
          "Your enthusiasm really shines through. Keep embracing these good moments!"
        ]
      },
      sadness: {
        mild: [
          "I'm sorry you're feeling down. Sometimes a little talk can help.",
          "It sounds like you're a bit sad. I'm here to listen."
        ],
        moderate: [
          "I understand that things feel heavy. Would you like to share more?",
          "Your sadness matters, and I'm here to help you navigate it."
        ],
        severe: [
          "I'm very concerned about your well-being. Please consider talking to someone you trust or a professional if these feelings intensify."
        ]
      },
      anger: {
        mild: [
          "It seems you're a little irritated. Sometimes a deep breath helps.",
          "I sense some frustration. Let's see if we can work through it."
        ],
        moderate: [
          "I understand your anger – would you like to explore what might be causing it?",
          "Your anger is clear; talking about it might ease some tension."
        ],
        severe: [
          "Your anger is very strong right now. It might help to pause and take a deep breath before continuing."
        ]
      },
      fear: {
        mild: [
          "I notice some anxiety in your words. It’s okay to feel this way sometimes.",
          "A little worry is natural; let’s see if we can find some calm."
        ],
        moderate: [
          "Your fear seems to be impacting you. Would you like some strategies to help manage these feelings?",
          "I understand that anxiety can be overwhelming. I'm here for you."
        ],
        severe: [
          "Your fear is very pronounced. If these feelings persist, please consider reaching out to a trusted professional or a support service immediately."
        ]
      }
      // You can add more emotions and responses as needed.
    };

    // Fallback response if no emotion is clearly detected.
    this.generalResponses = {
      mild: [
        "Thanks for sharing your thoughts.",
        "I'm here to listen if you'd like to share more."
      ],
      moderate: [
        "I appreciate you opening up. Sometimes talking things out can help.",
        "It sounds like you’re facing some challenges. Would you like to discuss them further?"
      ],
      severe: [
        "I'm really concerned about what you're going through. It might help to talk to someone who can offer deeper support.",
        "Your feelings are important. Please consider reaching out to a trusted professional or a crisis service."
      ]
    };
  }

  // Main method called by the UI.
  async analyzeInput(text) {
    // Detect emotions using our learner.
    const detectedEmotions = this.learner.detectEmotions(text);
    // Save to conversation history.
    this.conversationHistory.push({ text, detectedEmotions, timestamp: new Date() });

    // Determine risk level based on strong signals or concerning keywords.
    const riskLevel = this.assessRisk(text, detectedEmotions);

    // Determine dominant emotion.
    const dominantEntry = Object.entries(detectedEmotions).sort((a, b) => b[1] - a[1])[0];
    const dominantEmotion = dominantEntry ? dominantEntry[0] : null;
    const intensity = dominantEntry
      ? (dominantEntry[1] > 0.7 ? 'severe' : dominantEntry[1] > 0.4 ? 'moderate' : 'mild')
      : 'mild';

    // Choose an appropriate response.
    let response = '';
    if (riskLevel === 'severe') {
      response = "I'm very concerned about your well-being. If you feel unsafe or in crisis, please call emergency services immediately.";
    } else if (dominantEmotion && this.responses[dominantEmotion]) {
      const options = this.responses[dominantEmotion][intensity] || [];
      response = options[Math.floor(Math.random() * options.length)];
    } else {
      // Fallback general response.
      const options = this.generalResponses[intensity];
      response = options[Math.floor(Math.random() * options.length)];
    }

    return { response, emotions: detectedEmotions, riskLevel, dominantEmotion, intensity };
  }

  // A simple risk assessment based on keywords and strong emotion signals.
  assessRisk(text, emotions) {
    const concerningWords = ['suicide', 'kill', 'die', 'end it all', 'hopeless'];
    if (concerningWords.some(word => text.toLowerCase().includes(word))) {
      return 'severe';
    }
    // If any emotion’s normalized score is very high, that may be concerning.
    for (const score of Object.values(emotions)) {
      if (score > 0.9) return 'severe';
    }
    return 'low';
  }

  // Called by the UI when the user gives feedback on the response.
  provideFeedback(text, analysis, isPositive) {
    // Let the learner update its internal weights for the detected emotions.
    this.learner.updateWeights(analysis.emotions, isPositive);
    // Optionally, you could also log feedback or adjust your response strategies further.
    console.log("Feedback received. Updated emotion weights:", this.learner.patterns);
  }
}
