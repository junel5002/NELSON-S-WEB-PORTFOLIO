const words = ["Frontend Designer", "Web Designer", "UI/UX Designer", "Web Developer", "Software Tester"];
let wordIndex = 0;
let charIndex = 0;
let currentWord = '';
const typingSpeed = 150;
const erasingSpeed = 100;
const delayBetweenWords = 2000; // 2 seconds delay between words

const textElement = document.querySelector('.text-animation span');

// Function to type the current word
function typeWord() {
    if (charIndex === 0) {
        // Reset text content to prevent overlap
        textElement.textContent = '';
    }

    if (charIndex < currentWord.length) {
        textElement.textContent += currentWord.charAt(charIndex);
        charIndex++;
        setTimeout(typeWord, typingSpeed);
    } else {
        setTimeout(eraseWord, delayBetweenWords); // After typing, wait, then erase
    }
}

// Function to erase the current word
function eraseWord() {
    if (charIndex > 0) {
        textElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        setTimeout(eraseWord, erasingSpeed);
    } else {
        wordIndex = (wordIndex + 1) % words.length;
        currentWord = words[wordIndex];
        setTimeout(typeWord, typingSpeed); // Start typing the next word
    }
}

// Initialize the typing effect
document.addEventListener('DOMContentLoaded', () => {
    currentWord = words[wordIndex];
    setTimeout(typeWord, typingSpeed);
});
