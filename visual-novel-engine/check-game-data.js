const fs = require('fs');
const path = require('path');

class GameDataChecker {
    constructor(gameDataPath) {
        this.gameDataPath = gameDataPath;
        this.errors = [];
        this.warnings = [];
        this.fixes = [];
    }

    log(type, message) {
        console.log(`[${type.toUpperCase()}] ${message}`);
        if (type === 'ERROR') this.errors.push(message);
        if (type === 'WARNING') this.warnings.push(message);
        if (type === 'FIX') this.fixes.push(message);
    }

    checkFileExists(filePath, description) {
        const fullPath = path.join(this.gameDataPath, filePath);
        if (!fs.existsSync(fullPath)) {
            this.log('ERROR', `Missing file: ${filePath} (${description})`);
            return false;
        }
        this.log('OK', `Found: ${filePath}`);
        return true;
    }

    loadJSON(filePath) {
        try {
            const fullPath = path.join(this.gameDataPath, filePath);
            const content = fs.readFileSync(fullPath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            this.log('ERROR', `Failed to parse JSON in ${filePath}: ${error.message}`);
            return null;
        }
    }

    checkConfig() {
        console.log('\n=== Checking config.json ===');
        
        if (!this.checkFileExists('config.json', 'Main configuration file')) {
            return false;
        }

        const config = this.loadJSON('config.json');
        if (!config) return false;

        // Check required fields
        const requiredFields = ['name', 'startEvent', 'characters', 'story'];
        for (const field of requiredFields) {
            if (!config[field]) {
                this.log('ERROR', `config.json missing required field: ${field}`);
            }
        }

        // Check if referenced files exist
        if (config.characters && !this.checkFileExists(config.characters, 'Characters data file')) {
            return false;
        }
        if (config.story && !this.checkFileExists(config.story, 'Story data file')) {
            return false;
        }

        return config;
    }

    checkCharacters(config) {
        console.log('\n=== Checking characters.json ===');
        
        const characters = this.loadJSON(config.characters);
        if (!characters) return false;

        if (!characters.characters) {
            this.log('ERROR', 'characters.json missing "characters" object');
            return false;
        }

        // Check each character
        for (const [id, character] of Object.entries(characters.characters)) {
            console.log(`\nChecking character: ${id}`);
            
            if (!character.name) {
                this.log('ERROR', `Character ${id} missing name`);
            }
            
            if (!character.sprites) {
                this.log('ERROR', `Character ${id} missing sprites object`);
                continue;
            }

            // Check sprite files
            for (const [emotion, spritePath] of Object.entries(character.sprites)) {
                if (!this.checkFileExists(spritePath, `${id} ${emotion} sprite`)) {
                    this.log('WARNING', `Missing sprite will cause visual issues`);
                }
            }
        }

        return characters;
    }

    checkStory(config, characters) {
        console.log('\n=== Checking story.json ===');
        
        const story = this.loadJSON(config.story);
        if (!story) return false;

        if (!story.events) {
            this.log('ERROR', 'story.json missing "events" object');
            return false;
        }

        // Check if start event exists
        if (!story.events[config.startEvent]) {
            this.log('ERROR', `Start event "${config.startEvent}" not found in story.json`);
        }

        // Check each event
        for (const [eventId, event] of Object.entries(story.events)) {
            console.log(`\nChecking event: ${eventId}`);
            
            // Check background
            if (event.background && !this.checkFileExists(event.background, `${eventId} background`)) {
                this.log('WARNING', `Missing background will show black screen`);
            }

            // Check character references
            if (event.character) {
                const charId = event.character.id;
                if (!characters.characters[charId]) {
                    this.log('ERROR', `Event ${eventId} references unknown character: ${charId}`);
                }
            }

            // Check choices point to valid events
            if (event.choices) {
                for (const choice of event.choices) {
                    if (choice.nextEvent && !story.events[choice.nextEvent]) {
                        this.log('ERROR', `Choice in ${eventId} points to unknown event: ${choice.nextEvent}`);
                    }
                }
            }
        }

        return story;
    }

    fixCommonIssues() {
        console.log('\n=== Attempting fixes ===');
        
        // Create missing directories
        const dirs = ['backgrounds', 'sprites'];
        for (const dir of dirs) {
            const dirPath = path.join(this.gameDataPath, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                this.log('FIX', `Created missing directory: ${dir}`);
            }
        }

        // Fix config.json if missing
        const configPath = path.join(this.gameDataPath, 'config.json');
        if (!fs.existsSync(configPath)) {
            const defaultConfig = {
                "name": "My Visual Novel",
                "version": "1.0.0",
                "startEvent": "intro",
                "characters": "characters.json",
                "story": "story.json"
            };
            fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
            this.log('FIX', 'Created default config.json');
        }
    }

    generateReport() {
        console.log('\n' + '='.repeat(50));
        console.log('GAME DATA CHECK COMPLETE');
        console.log('='.repeat(50));
        
        console.log(`\n✅ Fixes applied: ${this.fixes.length}`);
        if (this.fixes.length > 0) {
            this.fixes.forEach(fix => console.log(`  - ${fix}`));
        }

        console.log(`\n⚠️  Warnings: ${this.warnings.length}`);
        if (this.warnings.length > 0) {
            this.warnings.forEach(warning => console.log(`  - ${warning}`));
        }

        console.log(`\n❌ Errors: ${this.errors.length}`);
        if (this.errors.length > 0) {
            this.errors.forEach(error => console.log(`  - ${error}`));
        }

        if (this.errors.length === 0) {
            console.log('\n🎉 No critical errors found! Your game should work.');
        } else {
            console.log('\n🔧 Please fix the errors above before running the game.');
        }
    }

    async run() {
        console.log(`Checking game data in: ${this.gameDataPath}`);
        
        // Check if directory exists
        if (!fs.existsSync(this.gameDataPath)) {
            this.log('ERROR', `Game data directory not found: ${this.gameDataPath}`);
            return;
        }

        // Apply fixes first
        this.fixCommonIssues();

        // Check all components
        const config = this.checkConfig();
        if (!config) return;

        const characters = this.checkCharacters(config);
        if (!characters) return;

        const story = this.checkStory(config, characters);
        
        this.generateReport();
    }
}

// Command line usage
if (require.main === module) {
    const gameDataPath = process.argv[2] || './game-data';
    const checker = new GameDataChecker(gameDataPath);
    checker.run();
}

module.exports = GameDataChecker;