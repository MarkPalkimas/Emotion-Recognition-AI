// emotionLearner.js
// A simple emotion learner that uses keyword patterns and adjusts weights based on feedback.

export default class EmotionLearner {
  constructor() {
    // Default patterns and weights.
    // In a production system, these could be loaded from a database.
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
      }
      // Extend with more emotions and keywords as needed.
    };

    // Load any previously saved adjustments from localStorage
    this.loadAdjustments();
  }

  loadAdjustments() {
    const saved = localStorage.getItem('emotionAdjustments');
    if (saved) {
      try {
        const adjustments = JSON.parse(saved);
        // Merge saved adjustments into our patterns
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

  // Analyze the given text and return a normalized emotion score object.
  detectEmotions(text) {
    const words = text.toLowerCase().split(/\s+/);
    const scores = {};

    // For each emotion, look for matching keywords.
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

    // Normalize scores to sum to 1
    const total = Object.values(scores).reduce((sum, s) => sum + s, 0);
    if (total > 0) {
      for (const emotion in scores) {
        scores[emotion] = scores[emotion] / total;
      }
    }
    return scores;
  }

  // Update internal weights based on feedback.
  // If positive feedback: increase the weight of emotions that were detected.
  // If negative: decrease them slightly.
  updateWeights(emotions, isPositiveFeedback) {
    const factor = isPositiveFeedback ? 1.05 : 0.95;
    for (const emotion in emotions) {
      if (this.patterns[emotion]) {
        this.patterns[emotion].weight *= factor;
        // Clamp weights to a reasonable range
        this.patterns[emotion].weight = Math.min(Math.max(this.patterns[emotion].weight, 0.5), 2.0);
      }
    }
    this.saveAdjustments();
  }
}
