class PasswordAnalyzer {
    constructor() {
        this.commonPasswords = new Set();
        this.minLength = 8;
        this.complexityRegex = {
            uppercase: /[A-Z]/,
            lowercase: /[a-z]/,
            digit: /\d/,
            special: /[!@#$%^&*(),.?":{}|<>]/
        };
    }

    async loadCommonPasswords(filePath = '/common_passwords.txt') {
        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error('Failed to load common passwords');
            const text = await response.text();
            this.commonPasswords = new Set(text.split('\n').map(p => p.trim().toLowerCase()).filter(p => p));
            document.getElementById('loading').classList.add('hidden');
        } catch (error) {
            document.getElementById('loading').classList.add('hidden');
            const errorDiv = document.getElementById('error');
            errorDiv.textContent = 'Error loading password list. Common password checks disabled.';
            errorDiv.classList.remove('hidden');
            console.error(error);
        }
    }

    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    checkCommonPassword(password) {
        return this.commonPasswords.size > 0 && this.commonPasswords.has(password.toLowerCase());
    }

    checkComplexity(password) {
        return {
            length: password.length >= this.minLength,
            uppercase: this.complexityRegex.uppercase.test(password),
            lowercase: this.complexityRegex.lowercase.test(password),
            digit: this.complexityRegex.digit.test(password),
            special: this.complexityRegex.special.test(password)
        };
    }

    calculateEntropy(password) {
        let poolSize = 0;
        if (this.complexityRegex.lowercase.test(password)) poolSize += 26;
        if (this.complexityRegex.uppercase.test(password)) poolSize += 26;
        if (this.complexityRegex.digit.test(password)) poolSize += 10;
        if (this.complexityRegex.special.test(password)) poolSize += 32;


        if (poolSize === 0) return 0;

        return (password.length * Math.log2(poolSize)).toFixed(2);
    }

    getStrengthLabel(entropy) {
        const value = parseFloat(entropy);
        if (value < 28) return { label: 'Very Weak', emoji: '😞' };
        if (value < 36) return { label: 'Weak', emoji: '😐' };
        if (value < 60) return { label: 'Moderate', emoji: '🙂' };
        return { label: 'Strong', emoji: '💪' };
    }

    generateRecommendations(complexityResults, isCommon) {
        const recommendations = [];
        if (this.commonPasswords.size > 0 && isCommon) {
            recommendations.push('Avoid using common passwords.');
        } else if (this.commonPasswords.size === 0) {
            recommendations.push('Common password check unavailable due to loading error.');
        }
        if (!complexityResults.length) recommendations.push(`Use at least ${this.minLength} characters.`);
        if (!complexityResults.uppercase) recommendations.push('Include at least one uppercase letter.');
        if (!complexityResults.lowercase) recommendations.push('Include at least one lowercase letter.');
        if (!complexityResults.digit) recommendations.push('Include at least one number.');
        if (!complexityResults.special) recommendations.push('Include at least one special character (e.g., !@#$%^&*).');
        if (!recommendations.length) recommendations.push('Your password is strong!');
        return recommendations;
    }

    async analyzePassword(password) {
        const isCommon = this.checkCommonPassword(password);
        const complexityResults = this.checkComplexity(password);
        const entropy = this.calculateEntropy(password);
        const { label, emoji } = this.getStrengthLabel(entropy);
        const recommendations = this.generateRecommendations(complexityResults, isCommon);
        return {
            passwordHash: await this.hashPassword(password),
            isCommon,
            complexity: complexityResults,
            entropy,
            strengthLabel: label,
            strengthEmoji: emoji,
            recommendations
        };
    }
}

const analyzer = new PasswordAnalyzer();
const passwordInput = document.getElementById('password');
const resultDiv = document.getElementById('result');
const strengthSpan = document.getElementById('strength');
const strengthLabelSpan = document.getElementById('strength-label');
const strengthEmojiSpan = document.getElementById('strength-emoji');
const commonSpan = document.getElementById('common');
const hashSpan = document.getElementById('hash');
const complexityList = document.getElementById('complexity');
const recommendationsList = document.getElementById('recommendations');

analyzer.loadCommonPasswords('/common_passwords.txt');

passwordInput.addEventListener('input', async () => {
    const password = passwordInput.value;
    if (!password) {
        resultDiv.classList.add('hidden');
        return;
    }
    resultDiv.classList.remove('hidden');
    const result = await analyzer.analyzePassword(password);

    strengthSpan.textContent = result.entropy;
    strengthSpan.className = result.strengthScore <= 50 ? 'text-red-600 font-bold' :
                            result.strengthScore <= 80 ? 'text-yellow-600 font-bold' :
                            'text-green-600 font-bold';
    strengthLabelSpan.textContent = result.strengthLabel;
    strengthEmojiSpan.textContent = result.strengthEmoji;
    commonSpan.textContent = result.isCommon ? 'Yes' : 'No';
    hashSpan.textContent = result.passwordHash;

    complexityList.innerHTML = '';
    for (const [check, passed] of Object.entries(result.complexity)) {
        const li = document.createElement('li');
        li.textContent = `${check.charAt(0).toUpperCase() + check.slice(1)}: ${passed ? '✓' : '✗'}`;
        li.className = passed ? 'text-green-600' : 'text-red-600';
        complexityList.appendChild(li);
    }

    recommendationsList.innerHTML = '';
    for (const rec of result.recommendations) {
        const li = document.createElement('li');
        li.textContent = rec;
        recommendationsList.appendChild(li);
    }
});