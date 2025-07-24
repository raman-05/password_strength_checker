# Password Strength Analyzer

A web-based tool to evaluate the strength of user passwords using entropy-based analysis, character composition checks, and comparison against a list of common passwords. This analyzer provides real-time feedback and improvement suggestions to help users create more secure passwords.

## Features

- *Entropy-Based Strength Evaluation*
  Calculates password strength using Shannon entropy and character pool analysis.

- *Character Composition Checks*
  Validates presence of:
  - Minimum length (default: 8)
  - Uppercase letters
  - Lowercase letters
  - Digits
  - Special characters

- *Common Password Detection*  
  Compares input against a list of 10k frequently used (compromised) passwords.

- *Secure Password Hashing*  
  Passwords are hashed using SHA-256 before display or storage (for demo only).

- *Recommendations Engine*  
  Provides dynamic suggestions to improve password strength and security.

- *Real-Time Feedback*  
  As the user types, feedback updates live with strength, complexity, and suggestions.

## Usage

```bash
cd NetWork_Security_Project
npm install
npx vite