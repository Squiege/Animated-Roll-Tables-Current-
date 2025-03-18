console.log("animation.js has loaded");


// Simulating a sliding loot box roll
export function startAnimatedRoll(rollTable) {
    if (!rollTable) {
        console.error("No roll table provided!");
        return;
    }

    console.log(`Rolling table: ${rollTable.name}`);

    let results = rollTable.results.map(r => ({
        img: r.img,
        text: r.text
    }));

    // Pre-select the winning result
    let winningIndex = Math.floor(Math.random() * results.length);
    let winningResult = results[winningIndex];

    console.log(`Winning Result Preselected: ${winningResult.text} at index ${winningIndex}`);

    // Start animation and pass the winning result
    new RollAnimationWindow(results, winningResult, winningIndex).render(true);
}

// Force register it globally
window.startAnimatedRoll = startAnimatedRoll;
console.log("startAnimatedRoll is now available globally.");

// Animation Logic
class RollAnimationWindow extends Application {
    constructor(results, winningResult, winningIndex) {
        super();
        this.results = results;
        this.winningResult = winningResult;
        this.winningIndex = winningIndex;  // Store the preselected winning index
        this.spins = 20;  // More spins for a natural slow-down effect
        this.speed = 30;  // Initial fast speed
        this.stripWidth = results.length * 120;  // Width of all images combined
        this.finalDelay = 3000;  // 3-second delay before revealing the result

    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "roll-animation",
            title: "Rolling...",
            template: "modules/animated-roll-tables/templates/roll-animation.html",
            width: 800,  // Adjusted to match larger icon size
            height: 400   // Increased to fit better
        });
    }
    

    async getData() {
        return { results: this.results };
    }

    activateListeners(html) {
        let displayArea = html.find(".roll-display");
    
        displayArea.empty(); // Clear previous images
    
        // Create a single image slot to display the rolling animation
        displayArea.append(`<img class="rolling-image" src="" alt="Rolling Image" />`);
    
        this.startRolling(displayArea.find(".rolling-image"));
    }

    startRolling(imageElement) {
        let index = 0;
        let initialSpeed = 50;  // Start fast
        let spinCount = 50;  // Total spins before stopping
        let slowSpinStart = 20;  // When to start slowing down
        let minSpeed = 700;  // Slowest speed
        let slowDownSteps = 15;  // More steps for smoother deceleration
        let textElement = $(".rolling-text");
    
        AudioHelper.play({ src: "modules/animated-roll-tables/assets/sounds/start.mp3" });
    
        let cycleImages = () => {
            if (spinCount > 0) {
                spinCount--;
    
                // Update image and name
                index = (index + 1) % this.results.length;
                let newImage = this.results[index].img;
                let newText = this.results[index].text;
    
                imageElement.fadeOut(50, function () {
                    $(this).attr("src", newImage).fadeIn(50);
                });
    
                textElement.fadeOut(50, function () {
                    $(this).text(newText).fadeIn(50);
                });
    
                // Apply easing curve for smooth slow-down
                if (spinCount < slowSpinStart) {
                    let progress = 1 - (spinCount / slowSpinStart);  // Progress through slow-down
                    let easingFactor = Math.pow(progress, 2.5);  // Easing curve (cubic for smoother stop)
                    let newSpeed = initialSpeed + (minSpeed - initialSpeed) * easingFactor;
                    initialSpeed = Math.min(newSpeed, minSpeed);
                }
    
                setTimeout(cycleImages, initialSpeed);
            } else {
                this.stopRolling(imageElement, textElement);
            }
        };
    
        cycleImages();
    }
    

    stopRolling(imageElement, textElement) {
        let winningIndex = this.winningIndex;
        let winningItem = this.results[winningIndex];
    
        console.log(`Stopping on winning index: ${winningIndex}, Winner: ${winningItem.text}`);
    
        setTimeout(() => {
            // Apply a final smooth ease-out before stopping completely
            imageElement.css({
                transition: "transform 3s cubic-bezier(0.3, 1, 0.5, 1)"
            });
    
            // Set final image and name to the winner
            imageElement.attr("src", winningItem.img);
            textElement.text(winningItem.text);
    
            // Reveal the winner after delay
            setTimeout(() => {
                this.showWinningResult(imageElement, textElement);
            }, this.finalDelay);
    
        }, 1200);
    }

    showWinningResult(imageElement, textElement) {
        let winningItem = this.winningResult;
    
        console.log(`Final Winner: ${winningItem.text}`);
    
        // Fade out rolling image and replace with winner display
        imageElement.fadeOut(500, function () {
            $(this).replaceWith(`
                <div class="winner-result">
                    <h2>🎉 You won: ${winningItem.text} 🎉</h2>
                    <img src="${winningItem.img}" alt="Winning Result" />
                </div>
            `);
        });
    
        // Play the winning sound
        AudioHelper.play({ src: "modules/animated-roll-tables/assets/sounds/win.mp3" });
    
        // Send the result to chat
        let chatMessage = `
            <div class="chat-card">
                <div class="chat-card-header">
                    <h2>🎉 Roll Result 🎉</h2>
                </div>
                <div class="chat-card-content">
                    <img src="${winningItem.img}" width="50" height="50" style="border-radius: 5px;">
                    <p><strong>${winningItem.text}</strong></p>
                </div>
            </div>
        `;
    
        ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker(),
            content: chatMessage
        });
    
        // Auto-close animation window after 7 seconds (optional)
        setTimeout(() => {
            this.close();
        }, 7000);
    }

}



