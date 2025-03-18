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
            width: 600,
            height: 200
        });
    }

    async getData() {
        return { results: this.results };
    }

    activateListeners(html) {
        let strip = html.find(".roll-strip");
        let indicator = html.find(".roll-indicator");
    
        strip.empty(); // Clear previous entries
    
        // Duplicate images multiple times for a smooth loop
        for (let i = 0; i < 10; i++) {  // Repeat 10x for seamless animation
            this.results.forEach((r) => {
                strip.append(`<img src="${r.img}" alt="${r.text}" />`);
            });
        }
    
        this.startRolling(strip, indicator);
    }
    

    startRolling(strip, indicator) {
        let position = 0;
        let initialSpeed = 30;  // Start fast
        let spinCount = 30;  // Spins before stopping
        let speedMultiplier = 1.1;  // Smooth slow-down
    
        AudioHelper.play({ src: "modules/animated-roll-tables/assets/sounds/start.mp3" });
    
        let loopAnimation = () => {
            if (spinCount > 0) {
                spinCount--;
    
                position -= 120;  // Move left by one item width
                strip.css({
                    transform: `translateX(${position}px)`,
                    transition: `transform ${initialSpeed}ms linear`
                });
    
                initialSpeed *= speedMultiplier;  // Gradually slow down
                if (initialSpeed > 900) initialSpeed = 900;  // Cap slow-down
    
                setTimeout(loopAnimation, initialSpeed);
            } else {
                this.stopRolling(strip, indicator);
            }
        };
    
        loopAnimation();
    }

    stopRolling(strip, indicator) {
        let containerWidth = strip.parent().width();
        let itemWidth = 120;
    
        // Calculate exact final stop position
        let finalOffset = -(this.winningIndex * itemWidth) + (containerWidth / 2 - itemWidth / 2);
    
        console.log(`Stopping at index ${this.winningIndex}, offset: ${finalOffset}`);
    
        setTimeout(() => {
            strip.css({
                //transform: `translateX(${finalOffset}px)`,
                transition: "transform 2s ease-out"
            });
    
            setTimeout(() => {
                strip.css({
                    transform: `translateX(${finalOffset}px)`,  // Keep locked in place
                    transition: "none"  // Prevent further movement
                });
    
                indicator.addClass("flash");  // Flash indicator on winner
    
                // Reveal the winner after delay
                setTimeout(() => {
                    this.showWinningResult(strip, indicator);
                }, this.finalDelay);
    
            }, 2200);
    
        }, 1200);
    }
    
    showWinningResult(strip, indicator) {
        strip.empty(); // Clear out the spinning images
        indicator.removeClass("flash");
    
        strip.append(`
            <div class="winner-result">
                <h2>🎉 You won: ${this.winningResult.text} 🎉</h2>
                <img src="${this.winningResult.img}" alt="Winning Result" />
            </div>
        `);
    
        strip.css({
            transform: "translateX(0px)",
            transition: "none"
        });
    
        // Play the winning sound
        AudioHelper.play({ src: "modules/animated-roll-tables/assets/sounds/win.mp3" });
    
        // Auto-close animation window after 5 seconds (optional)
        setTimeout(() => {
            this.close();
        }, 7000);
    }
    
}



