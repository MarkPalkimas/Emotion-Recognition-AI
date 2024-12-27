// therapeutic-handler.js
import { emotionPatterns, therapeuticResponses, medicalGuidance } from './emotion-database.js';

class TherapeuticHandler {
    constructor() {
        this.conversationHistory = [];
        this.currentEmotionalState = null;
        this.riskLevel = 'low';
    }

    async analyzeInput(text) {
        // Analyze emotional content
        const emotions = await this.detectEmotions(text);
        
        // Update conversation history
        this.conversationHistory.push({
            text: text,
            emotions: emotions,
            timestamp: new Date()
        });

        // Assess risk level
        this.riskLevel = this.assessRiskLevel(emotions, text);

        // Generate appropriate response
        return this.generateResponse(emotions);
    }

    async detectEmotions(text) {
        const words = text.toLowerCase().split(/\s+/);
        const emotions = {};

        // Analyze text against emotion patterns
        for (const [emotion, patterns] of Object.entries(emotionPatterns)) {
            let score = 0;
            
            // Check keywords
            patterns.keywords.forEach(keyword => {
                if (words.includes(keyword)) {
                    score += patterns.weights.keyword;
                }
            });

            // Check phrases
            patterns.phrases.forEach(phrase => {
                if (text.toLowerCase().includes(phrase)) {
                    score += patterns.weights.phrase;
                }
            });

            // Add intensity modifiers
            patterns.intensity_modifiers.forEach(modifier => {
                if (words.includes(modifier)) {
                    score += patterns.weights.intensity;
                }
            });

            if (score > 0) {
                emotions[emotion] = score;
            }
        }

        return this.normalizeEmotions(emotions);
    }

    normalizeEmotions(emotions) {
        const total = Object.values(emotions).reduce((sum, score) => sum + score, 0);
        const normalized = {};
        
        for (const [emotion, score] of Object.entries(emotions)) {
            normalized[emotion] = score / total;
        }
        
        return normalized;
    }

    assessRiskLevel(emotions, text) {
        // Check for severe emotional states
        const severityIndicators = {
            depression: 0.7,
            anxiety: 0.8,
            anger: 0.9
        };

        for (const [emotion, threshold] of Object.entries(severityIndicators)) {
            if (emotions[emotion] && emotions[emotion] > threshold) {
                return 'high';
            }
        }

        // Check for concerning keywords
        const highRiskWords = ['suicide', 'kill', 'die', 'end it all', 'no point'];
        if (highRiskWords.some(word => text.toLowerCase().includes(word))) {
            return 'severe';
        }

        return 'low';
    }

    generateResponse(emotions) {
        // Handle severe cases first
        if (this.riskLevel === 'severe') {
            return {
                response: "I'm very concerned about what you're sharing. Your life matters, and help is available right now. Please contact emergency services or a crisis helpline immediately.",
                emergencyResources: true,
                recommendProfessional: true
            };
        }

        // Get the dominant emotion
        const dominantEmotion = Object.entries(emotions)
            .sort(([,a], [,b]) => b - a)[0][0];

        // Generate therapeutic response
        const intensity = emotions[dominantEmotion] > 0.7 ? 'severe' : 
                        emotions[dominantEmotion] > 0.4 ? 'moderate' : 'mild';

        const responses = therapeuticResponses[dominantEmotion]?.[intensity] || 
            therapeuticResponses.general[intensity];

        // Get random response from appropriate category
        const response = responses[Math.floor(Math.random() * responses.length)];

        // Add medical guidance if appropriate
        let medicalAdvice = null;
        if (medicalGuidance[dominantEmotion]) {
            medicalAdvice = {
                selfHelp: medicalGuidance[dominantEmotion].selfHelp,
                seekHelpIf: medicalGuidance[dominantEmotion].seekHelpIf
            };
        }

        return {
            response,
            medicalAdvice,
            recommendProfessional: intensity === 'severe',
            emotion: dominantEmotion,
            intensity
        };
    }
}

export default TherapeuticHandler;
