// therapeuticHandler.js
import EmotionLearner from './emotionLearner.js';

export default class TherapeuticHandler {
  constructor() {
    this.learner = new EmotionLearner();
    this.conversationHistory = [];
    this.mlModel = null;   // Optionally load a pre-trained TensorFlow.js model.
    this.encoder = null;   // Universal Sentence Encoder.
    // Predefined therapeutic responses.
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
          "I'm sorry you're feeling down. Sometimes talking things out can help.",
          "It sounds like you're a bit sad. I'm here to listen."
        ],
        moderate: [
          "I understand that things are tough. Would you like to share more?",
          "Your sadness matters. Let's talk about it."
        ],
        severe: [
          "I'm very concerned about your well-being. Please consider seeking professional help if these feelings persist."
        ]
      },
      anger: {
        mild: [
          "It seems you're a little irritated. Sometimes a deep breath helps.",
          "I sense some frustration. Let's work through it."
        ],
        moderate: [
          "I understand your anger – would you like to explore what's causing it?",
          "Talking about your anger might ease some tension."
        ],
        severe: [
          "Your anger is very strong. It might help to pause and take a deep breath before continuing."
        ]
      },
      fear: {
        mild: [
          "I notice some anxiety in your words. It’s okay to feel this way sometimes.",
          "A little worry is natural; let's see if we can find some calm."
        ],
        moderate: [
          "Your fear seems to be affecting you. Would you like some strategies to help manage it?",
          "I understand that anxiety can be overwhelming. I'm here for you."
        ],
        severe: [
          "Your fear is very pronounced. If these feelings persist, please consider talking to a trusted professional immediately."
        ]
      },
      surprise: {
        mild: [
          "You seem a bit surprised. Would you like to talk more about it?",
          "Surprises can be unsettling sometimes."
        ],
        moderate: [
          "I sense something unexpected happened. Do you want to share more about it?",
          "It sounds like you're still processing the surprise."
        ],
        severe: [
          "That surprise seems to have really shaken you. Please consider seeking support if it overwhelms you."
        ]
      },
      love: {
        mild: [
          "I sense warmth in your words.",
          "It's nice to feel loved."
        ],
        moderate: [
          "Your words radiate love and care. That’s a beautiful emotion.",
          "The love you express is evident. Thank you for sharing."
        ],
        severe: [
          "Your deep feelings of love shine through. It’s important to nurture these emotions."
        ]
      },
      anxiety: {
        mild: [
          "A bit of worry is natural. Would you like to discuss what’s on your mind?",
          "I can sense some anxiety. Let’s find a way to ease it."
        ],
        moderate: [
          "I understand that anxiety can be challenging. Would you like some techniques to manage it?",
          "Your anxiety is affecting you. I'm here to help."
        ],
        severe: [
          "Your anxiety is very pronounced. If it overwhelms you, please consider speaking with a professional."
        ]
      },
      disgust: {
        mild: [
          "It seems something is repulsive. Would you like to share more about it?",
          "I sense discomfort in your words."
        ],
        moderate: [
          "The disgust you’re feeling is apparent. Talking about it might help.",
          "I understand that feeling repulsed is distressing. I'm here to listen."
        ],
        severe: [
          "Your sense of disgust is very strong. If it continues to trouble you, please consider reaching out for professional support."
        ]
      }
    };

    // Fallback general responses.
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
        "I'm really concerned about what you're going through. Please consider seeking deeper support.",
        "Your feelings are important. If you need help, please reach out to a trusted professional."
      ]
    };
  }

  // Load ML components: the Universal Sentence Encoder and optionally a pre-trained model.
  async loadMLComponents() {
    try {
      // Load the Universal Sentence Encoder.
      this.encoder = await use.load();
      // Optionally load a TensorFlow.js model.
      // (Update the URL to your model. If you don’t have one, this step is skipped.)
      this.mlModel = await tf.loadLayersModel('https://raw.githubusercontent.com/your-username/your-repo/main/model/model.json');
    } catch (error) {
      console.error('Error loading ML components:', error);
      this.mlModel = null;
    }
  }

  // Main method to analyze input text.
  async analyzeInput(text) {
    // Ensure ML components are loaded.
    if (!this.encoder || (this.mlModel === null && typeof this.mlModel === 'undefined')) {
      await this.loadMLComponents();
    }

    // Get semantic (ML) scores if possible.
    let mlEmotions = {};
    if (this.encoder && this.mlModel) {
      try {
        const embeddings = await this.encoder.embed([text]);
        const predictions = await this.mlModel.predict(embeddings).data();
        // Assume fixed order: joy, sadness, anger, fear, surprise, love, anxiety, disgust.
        const emotionList = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'love', 'anxiety', 'disgust'];
        mlEmotions = emotionList.reduce((obj, emotion, i) => {
          obj[emotion] = predictions[i];
          return obj;
        }, {});
      } catch (e) {
        console.error('Error during ML prediction:', e);
      }
    }

    // Get rule–based scores from our learner.
    const ruleEmotions = this.learner.detectEmotions(text);

    // Combine scores (simple average; you may adjust weights).
    const combinedEmotions = this.combineEmotionScores(mlEmotions, ruleEmotions);

    // Save conversation history.
    this.conversationHistory.push({ text, emotions: combinedEmotions, timestamp: new Date() });

    // Assess risk based on keywords or high scores.
    const riskLevel = this.assessRisk(text, combinedEmotions);

    // Determine dominant emotion and its intensity.
    const dominantEntry = Object.entries(combinedEmotions).sort((a, b) => b[1] - a[1])[0];
    const dominantEmotion = dominantEntry ? dominantEntry[0] : null;
    const intensity = dominantEntry
      ? (dominantEntry[1] > 0.7 ? 'severe' : dominantEntry[1] > 0.4 ? 'moderate' : 'mild')
      : 'mild';

    // Generate a response.
    let response = '';
    if (riskLevel === 'severe') {
      response = "I'm very concerned about your well-being. If you feel unsafe or are in crisis, please call emergency services immediately.";
    } else if (dominantEmotion && this.responses[dominantEmotion]) {
      const options = this.responses[dominantEmotion][intensity] || [];
      response = options[Math.floor(Math.random() * options.length)];
    } else {
      const options = this.generalResponses[intensity];
      response = options[Math.floor(Math.random() * options.length)];
    }

    return { response, emotions: combinedEmotions, riskLevel, dominantEmotion, intensity };
  }

  // Combine ML and rule-based scores.
  combineEmotionScores(mlScores, ruleScores) {
    const combined = {};
    const emotions = new Set([...Object.keys(mlScores), ...Object.keys(ruleScores)]);
    emotions.forEach(emotion => {
      combined[emotion] = ((mlScores[emotion] || 0) + (ruleScores[emotion] || 0)) / 2;
    });
    return combined;
  }

  // Assess risk based on strong emotion signals or concerning keywords.
  assessRisk(text, emotions) {
    const concerningWords = ['suicide', 'kill', 'die', 'end it all', 'hopeless'];
    if (concerningWords.some(word => text.toLowerCase().includes(word))) {
      return 'severe';
    }
    for (const score of Object.values(emotions)) {
      if (score > 0.9) return 'severe';
    }
    return 'low';
  }

  // Called when the user provides feedback.
  provideFeedback(text, analysis, isPositive) {
    // Update our learner's weights.
    this.learner.updateWeights(analysis.emotions, isPositive);
    console.log("Feedback received. Updated emotion weights:", this.learner.patterns);
  }
}
