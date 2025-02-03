// emotionLearner.js
export default class EmotionLearner {
  constructor() {
    // Default patterns with keywords and weights.
    this.patterns = {
      joy: {
        keywords: ['happy', 'joyful', 'delighted', 'pleased', 'content'],
        weight: 1.0
      },
      sadness: {
        keywords: ['sad', 'unhappy', 'depressed', 'miserable', 'down'],
        weight: 1.0
      },
      anger: {
        keywords: ['angry', 'mad', 'furious', 'irate', 'annoyed'],
        weight: 1.0
      },
      fear: {
        keywords: ['scared', 'afraid', 'frightened', 'nervous', 'anxious'],
        weight: 1.0
      },
      surprise: {
        keywords: ['surprised', 'shocked', 'amazed', 'stunned'],
        weight: 1.0
      },
      love: {
        keywords: ['love', 'adore', 'cherish', 'fond'],
        weight: 1.0
      },
      anxiety: {
        keywords: ['anxiety', 'anxious', 'worry', 'nervous'],
        weight: 1.0
      }
    };

    this.loadAdjustments();
  }

  // Load previously saved weights from localStorage.
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

  // Save current weights to localStorage.
  saveAdjustments() {
    const adjustments = {};
    for (const emotion in this.patterns) {
      adjustments[emotion] = this.patterns[emotion].weight;
    }
    localStorage.setItem('emotionAdjustments', JSON.stringify(adjustments));
  }

  // Detect emotions by scanning the text for keyword occurrences.
  detectEmotions(text) {
    const words = text.toLowerCase().split(/\s+/);
    const scores = {};

    for (const [emotion, data] of Object.entries(this.patterns)) {
      let score = 0;
      data.keywords.forEach(keyword => {
        // Count occurrences of the keyword in the text.
        const count = words.filter(word => word.includes(keyword)).length;
        score += count * data.weight;
      });
      if (score > 0) {
        scores[emotion] = score;
      }
    }

    // Normalize scores so they sum to 1.
    const total = Object.values(scores).reduce((sum, s) => sum + s, 0);
    if (total > 0) {
      for (const emotion in scores) {
        scores[emotion] = scores[emotion] / total;
      }
    }
    return scores;
  }

  // Update internal weights based on user feedback.
  updateWeights(emotions, isPositiveFeedback) {
    const factor = isPositiveFeedback ? 1.05 : 0.95;
    for (const emotion in emotions) {
      if (this.patterns[emotion]) {
        this.patterns[emotion].weight *= factor;
        // Clamp weights between 0.5 and 2.0.
        this.patterns[emotion].weight = Math.min(Math.max(this.patterns[emotion].weight, 0.5), 2.0);
      }
    }
    this.saveAdjustments();
  }
}
