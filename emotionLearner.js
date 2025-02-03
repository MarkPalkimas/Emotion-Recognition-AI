// emotionLearner.js
import { emotionLexicon } from './emotionDataset.js';

export default class EmotionLearner {
  constructor() {
    // Default patterns with additional keywords.
    this.patterns = {
      joy: {
        keywords: ['happy', 'joyful', 'delighted', 'cheerful'],
        weight: 1.0
      },
      sadness: {
        keywords: ['sad', 'depressed', 'miserable', 'down'],
        weight: 1.0
      },
      anger: {
        keywords: ['angry', 'furious', 'irate', 'annoyed'],
        weight: 1.0
      },
      fear: {
        keywords: ['scared', 'afraid', 'frightened', 'nervous'],
        weight: 1.0
      },
      surprise: {
        keywords: ['surprised', 'shocked', 'astonished'],
        weight: 1.0
      },
      love: {
        keywords: ['love', 'adore', 'cherish', 'fond'],
        weight: 1.0
      },
      anxiety: {
        keywords: ['anxiety', 'anxious', 'worry', 'uneasy'],
        weight: 1.0
      },
      disgust: {
        keywords: ['disgusted', 'repulsed', 'revolted'],
        weight: 1.0
      }
    };

    // Load any saved adjustments.
    this.loadAdjustments();
  }

  loadAdjustments() {
    const saved = localStorage.getItem('emotionAdjustments');
    if (saved) {
      try {
        const adjustments = JSON.parse(saved);
        for (const emotion in adjustments) {
          if (this.patterns[emotion]) {
            this.patterns[emotion].weight = adjustments[emotion];
          }
        }
      } catch (e) {
        console.error('Error parsing saved adjustments:', e);
      }
    }
  }

  saveAdjustments() {
    const adjustments = {};
    for (const emotion in this.patterns) {
      adjustments[emotion] = this.patterns[emotion].weight;
    }
    localStorage.setItem('emotionAdjustments', JSON.stringify(adjustments));
  }

  // Detect emotions using our rule-based patterns plus the lexicon.
  detectEmotions(text) {
    const words = text.toLowerCase().split(/\s+/);
    const scores = {};

    // First, score using our internal patterns.
    for (const [emotion, data] of Object.entries(this.patterns)) {
      let score = 0;
      data.keywords.forEach(keyword => {
        const count = words.filter(word => word.includes(keyword)).length;
        score += count * data.weight;
      });
      if (score > 0) scores[emotion] = (scores[emotion] || 0) + score;
    }

    // Then, boost scores using the external lexicon.
    words.forEach(word => {
      if (emotionLexicon[word]) {
        const { emotion, score } = emotionLexicon[word];
        scores[emotion] = (scores[emotion] || 0) + score;
      }
    });

    // Normalize the scores so they sum to 1.
    const total = Object.values(scores).reduce((sum, s) => sum + s, 0);
    if (total > 0) {
      for (const emotion in scores) {
        scores[emotion] = scores[emotion] / total;
      }
    }
    return scores;
  }

  // Update internal weights based on feedback.
  updateWeights(emotions, isPositiveFeedback) {
    const factor = isPositiveFeedback ? 1.05 : 0.95;
    for (const emotion in emotions) {
      if (this.patterns[emotion]) {
        this.patterns[emotion].weight *= factor;
        // Clamp between 0.5 and 2.0.
        this.patterns[emotion].weight = Math.min(Math.max(this.patterns[emotion].weight, 0.5), 2.0);
      }
    }
    this.saveAdjustments();
  }
}
