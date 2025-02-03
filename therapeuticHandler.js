// therapeuticHandler.js
import EmotionLearner from './emotionLearner.js';

export default class TherapeuticHandler {
  constructor() {
    this.learner = new EmotionLearner();
    this.conversationHistory = [];
    this.mlModel = null;      // Will hold the loaded TensorFlow.js model (if available)
    this.encoder = null;      // Universal Sentence Encoder
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
      },
      surprise: {
        mild: [
          "You seem a bit surprised. Would you like to talk more about it?",
          "Surprises can be unsettling sometimes. I'm here to help."
        ],
        moderate: [
          "I sense that something unexpected happened. Do you want to share more about it?",
          "It sounds like you're still processing the surprise. Let's talk about it."
        ],
        severe: [
          "The surprise seems to have really shaken you. If you feel overwhelmed, please consider seeking support."
        ]
      },
      love: {
        mild: [
          "I sense warmth in your words.",
          "It's nice to feel loved. Keep cherishing those moments."
        ],
        moderate: [
          "Your words radiate love and care. It’s a beautiful emotion.",
          "The love you express is evident. Thank you for sharing it."
        ],
        severe: [
          "Your deep feelings of love shine through. It’s important to nurture these emotions."
        ]
      },
      anxiety: {
        mild: [
          "A bit of worry is natural. Would you like to discuss what’s on your mind?",
          "I can sense some anxiety. Let’s see if we can find a way to ease it."
        ],
        moderate: [
          "I understand that anxiety can be challenging. Would you like some strategies to help manage it?",
          "Your anxiety seems to be affecting you. I'm here to help you explore some calming techniques."
        ],
        severe: [
          "Your anxiety is very pronounced. If it continues to overwhelm you, please consider reaching out to a professional."
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
        "I'm really concerned about what you're going through. It might help to talk to someone who can offer deeper support.",
        "Your feelings are important. Please consider reaching out to a trusted professional or crisis service."
      ]
    };
  }

  // Load the ML model and the Universal Sentence Encoder.
  async loadMLComponents() {
    try {
      // Load the Universal Sentence Encoder.
      this.encoder = await use.load();
      // Attempt to load a pre-trained TensorFlow.js model (update URL accordingly).
      this.mlModel = await tf.loadLayersModel('https://raw.githubusercontent.com/your-username/your-repo/main/model/model.json');
    } catch (error) {
      console.error('Error loading ML components:', error);
      this.mlModel = null; // Fallback to rule-based learner.
    }
  }

  // Main method called by the UI.
  async analyzeInput(text) {
    // Check if ML components are loaded; if not, try to load them.
    if (!this.encoder || !this.mlModel) {
      await this.loadMLComponents();
    }

    // Get ML-based emotions if available.
    let mlEmotions = {};
    if (this.encoder && this.mlModel) {
      try {
        const embeddings = await this.encoder.embed([text]);
        const predictions = await this.mlModel.predict(embeddings).data();
        // Assuming a fixed order of emotions for the ML model.
        const emotionList = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'love', 'anxiety'];
        mlEmotions = emotionList.reduce((obj, emotion, i) => {
          obj[emotion] = predictions[i];
          return obj;
        }, {});
      } catch (e) {
        console.error('Error during ML model prediction:', e);
      }
    }

    // Get rule-based emotions.
    const ruleEmotions = this.learner.detectEmotions(text);
    // Combine the two sets of scores (simple average).
    const combinedEmotions = this.combineEmotionScores(mlEmotions, ruleEmotions);

    // Save conversation history.
    this.conversationHistory.push({ text, emotions: combinedEmotions, timestamp: new Date() });

    // Assess risk.
    const riskLevel = this.assessRisk(text, combinedEmotions);

    // Determine dominant emotion and intensity.
    const dominantEntry = Object.entries(combinedEmotions).sort((a, b) => b[1] - a[1])[0];
    const dominantEmotion = dominantEntry ? dominantEntry[0] : null;
    const intensity = dominantEntry
      ? (dominantEntry[1] > 0.7 ? 'severe' : dominantEntry[1] > 0.4 ? 'moderate' : 'mild')
      : 'mild';

    // Generate an appropriate response.
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

  // Combine ML and rule-based scores (simple average; adjust weights if needed).
  combineEmotionScores(mlScores, ruleScores) {
    const combined = {};
    const emotions = new Set([...Object.keys(mlScores), ...Object.keys(ruleScores)]);
    emotions.forEach(emotion => {
      combined[emotion] = ((mlScores[emotion] || 0) + (ruleScores[emotion] || 0)) / 2;
    });
    return combined;
  }

  // Basic risk assessment based on keywords and strong emotion signals.
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

  // Called when the user gives feedback.
  provideFeedback(text, analysis, isPositive) {
    // Update the rule-based learner's weights.
    this.learner.updateWeights(analysis.emotions, isPositive);
    console.log("Feedback received. Updated emotion weights:", this.learner.patterns);
  }
}
