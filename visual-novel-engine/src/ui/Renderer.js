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
          <div class="dialogue-box">
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
  }

  renderEvent(event, character, backgroundImg, characterImg) {
    // Update background
    if (backgroundImg) {
      this.elements.background.src = backgroundImg.src;
      this.elements.background.style.display = 'block';
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

    // Update dialogue
    this.elements.dialogueText.textContent = '';
    this.typewriterEffect(event.dialogue);
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
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        this.elements.dialogueText.textContent += text[index];
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);
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