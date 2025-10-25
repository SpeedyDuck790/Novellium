export class Renderer {
  constructor(containerElement) {
    this.container = containerElement;
    this.elements = {
      background: null,
      characterContainer: null,
      dialogueBox: null,
      dialogueText: null,
      choicesContainer: null
    };
    this.currentTypewriterInterval = null;
    this.isTyping = false;
    this.currentText = '';
    this.initialize();
  }

  initialize() {
    this.container.innerHTML = `
      <div class="game-screen">
        <div class="background-layer">
          <img id="background" class="background" />
        </div>
        <div class="character-layer">
          <img id="character" class="character" />
        </div>
        <div class="dialogue-layer">
          <div class="dialogue-box" id="dialogue-box">
            <div id="character-name" class="character-name"></div>
            <div id="dialogue-text" class="dialogue-text"></div>
          </div>
          <div id="choices" class="choices-container"></div>
        </div>
      </div>
    `;

    this.elements.background = document.getElementById('background');
    this.elements.character = document.getElementById('character');
    this.elements.characterName = document.getElementById('character-name');
    this.elements.dialogueText = document.getElementById('dialogue-text');
    this.elements.choicesContainer = document.getElementById('choices');
    this.elements.dialogueBox = document.getElementById('dialogue-box');

    // Add click listener to skip typewriter effect
    this.elements.dialogueBox.addEventListener('click', (e) => {
      // Don't skip typewriter if choices are visible (user should click choices instead)
      if (this.elements.choicesContainer.children.length > 0) {
        return;
      }
      
      if (this.isTyping) {
        this.skipTypewriter();
      }
    });
  }

  renderEvent(event, character, backgroundImg, characterImg) {
    // Ensure dialogue box is visible
    if (this.elements.dialogueBox) {
      this.elements.dialogueBox.style.display = 'block';
    }
    
    // Update background
    if (backgroundImg) {
      this.elements.background.src = backgroundImg.src;
      this.elements.background.style.display = 'block';
    } else {
      this.elements.background.style.display = 'none';
    }

    // Update character
    if (character && characterImg) {
      this.elements.character.src = characterImg.src;
      this.elements.character.style.display = 'block';
      this.elements.character.className = `character position-${event.character.position}`;
      this.elements.characterName.textContent = character.name;
    } else {
      this.elements.character.style.display = 'none';
      this.elements.characterName.textContent = '';
    }

    // Clear any existing typewriter animation before starting new one
    this.clearTypewriter();
    
    // Hide choices container when starting new dialogue
    this.elements.choicesContainer.innerHTML = '';
    
    // Update dialogue - ensure we have text
    this.elements.dialogueText.textContent = '';
    if (event.dialogue) {
      this.typewriterEffect(event.dialogue);
    }
  }

  renderChoices(choices, onChoiceSelected) {
    this.elements.choicesContainer.innerHTML = '';
    
    choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.className = 'choice-button';
      button.textContent = choice.text;
      button.onclick = () => onChoiceSelected(choice, index);
      this.elements.choicesContainer.appendChild(button);
    });
  }

  typewriterEffect(text, speed = 30) {
    // Clear any existing typewriter animation
    this.clearTypewriter();
    
    // Set current text for reference
    this.currentText = text;
    this.isTyping = true;

    let index = 0;
    
    const typeNextCharacter = () => {
      if (index < text.length) {
        this.elements.dialogueText.textContent += text[index];
        index++;
        this.currentTypewriterInterval = setTimeout(typeNextCharacter, speed);
      } else {
        this.isTyping = false;
      }
    };

    typeNextCharacter();
  }

  skipTypewriter() {
    if (this.isTyping && this.currentText) {
      // Clear the interval
      this.clearTypewriter();
      
      // Display full text immediately
      this.elements.dialogueText.textContent = this.currentText;
      this.isTyping = false;
    }
  }

  clearTypewriter() {
    if (this.currentTypewriterInterval) {
      clearTimeout(this.currentTypewriterInterval);
      this.currentTypewriterInterval = null;
    }
  }

  showError(message) {
    this.container.innerHTML = `
      <div class="error-screen">
        <h2>Error</h2>
        <p>${message}</p>
      </div>
    `;
  }
}