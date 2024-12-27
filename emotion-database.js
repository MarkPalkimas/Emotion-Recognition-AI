
// emotion-database.js
const emotionPatterns = {
    // Core emotions
    joy: {
        keywords: ['happy', 'joyful', 'delighted', 'pleased', 'content'],
        phrases: ['feeling good', 'doing great', 'so happy that', 'makes me smile'],
        intensity_modifiers: ['very', 'extremely', 'somewhat', 'slightly'],
        contextual_hints: ['because', 'when', 'after'],
        weights: {
            keyword: 1.0,
            phrase: 1.2,
            context: 0.8,
            intensity: 0.5
        }
    },
    depression: {
        keywords: ['depressed', 'hopeless', 'worthless', 'empty', 'numb'],
        phrases: ['feeling down', 'cannot see hope', 'want to give up', 'nothing matters'],
        intensity_modifiers: ['very', 'extremely', 'constantly', 'always'],
        contextual_hints: ['because', 'since', 'lately'],
        weights: {
            keyword: 1.0,
            phrase: 1.2,
            context: 0.8,
            intensity: 0.5
        }
    },
    anxiety: {
        keywords: ['anxious', 'worried', 'nervous', 'stressed', 'panicked'],
        phrases: ['cant stop thinking', 'what if', 'scared that', 'nervous about'],
        intensity_modifiers: ['very', 'extremely', 'constantly', 'always'],
        contextual_hints: ['because', 'about', 'when'],
        weights: {
            keyword: 1.0,
            phrase: 1.2,
            context: 0.8,
            intensity: 0.5
        }
    }
    // Add more emotions...
};

const therapeuticResponses = {
    depression: {
        mild: [
            "I hear that you're feeling down. Would you like to talk more about what's troubling you?",
            "It's okay to feel this way. What kind of support would be most helpful right now?",
            "I notice you're dealing with some difficult emotions. Would you like to explore them together?"
        ],
        moderate: [
            "I'm concerned about how you're feeling. Have you considered speaking with a counselor?",
            "These feelings are significant. Would you be open to discussing professional support options?",
            "You're dealing with a lot right now. There are people who can help - would you like information about professional resources?"
        ],
        severe: [
            "I'm very concerned about your well-being. Please know that help is available 24/7 at [emergency helpline].",
            "These feelings are serious and you deserve immediate support. Would you like the number for a crisis helpline?",
            "Your life has value and there are people who want to help. Can I provide you with emergency resource information?"
        ]
    },
    anxiety: {
        mild: [
            "Let's take a moment to breathe together. Would you like to try a quick relaxation exercise?",
            "Anxiety can be overwhelming. What usually helps you feel more grounded?",
            "It's natural to feel anxious sometimes. Would you like to talk about what's causing these feelings?"
        ],
        moderate: [
            "These anxiety levels sound challenging. Have you considered speaking with a counselor?",
            "Managing anxiety can be difficult alone. Would you like to know about some professional support options?",
            "I hear how much this is affecting you. There are specialists who can help - would you like more information?"
        ],
        severe: [
            "This level of anxiety needs professional attention. Would you like information about emergency services?",
            "You don't have to handle this alone. Can I provide you with crisis support resources?",
            "I'm concerned about your anxiety levels. Let me share some immediate help options with you."
        ]
    }
    // Add more therapeutic responses...
};

const medicalGuidance = {
    anxiety: {
        symptoms: ['rapid heartbeat', 'sweating', 'trembling', 'difficulty breathing'],
        selfHelp: [
            "Practice deep breathing exercises",
            "Try progressive muscle relaxation",
            "Maintain a regular sleep schedule",
            "Limit caffeine and alcohol"
        ],
        seekHelpIf: [
            "Panic attacks are frequent or severe",
            "Anxiety interferes with daily life",
            "Physical symptoms are severe",
            "You have thoughts of self-harm"
        ]
    },
    depression: {
        symptoms: ['persistent sadness', 'loss of interest', 'sleep changes', 'fatigue'],
        selfHelp: [
            "Maintain a daily routine",
            "Get regular exercise",
            "Stay connected with others",
            "Practice self-care activities"
        ],
        seekHelpIf: [
            "Symptoms last more than two weeks",
            "Unable to perform daily tasks",
            "Having thoughts of self-harm",
            "Experiencing severe hopelessness"
        ]
    }
    // Add more conditions...
};

export { emotionPatterns, therapeuticResponses, medicalGuidance };
