import { startAnimatedRoll } from "./animation.js";



// Initialize module
Hooks.on("ready", () => {
    console.log("My Awesome Module is loaded!");
});
console.log("✅ main.js is loading...");

// EXAMPLES

// Adding button to sidebar example
Hooks.on("renderSidebarTab", (app, html) => {
    if (app.options.id === "chat") {
        let button = $(`<button class="my-button">Click Me</button>`);
        button.on("click", () => console.log("Button Clicked!"));
        html.append(button);
    }
});

// Modify actor data example
Hooks.on("createActor", (actor) => {
    console.log(`A new actor has been created: ${actor.name}`);
});

// Modify item data example
Hooks.on("createItem", (item) => {
    console.log(`A new item has been created: ${item.name}`);
});

// Add a new Chat Command example
Hooks.on("chatMessage", (chatLog, messageText) => {
    if (messageText.startsWith("/hello")) {
        ChatMessage.create({ content: "Hello, Foundry!" });
        return false;  // Prevents Foundry from processing further
    }
});


// Module Snippets

// Adds a button inside the roll table UI
Hooks.on("renderRollTableConfig", (app, html, data) => {
    let footer = html.find(".sheet-footer");
    if (footer.length === 0) footer = html; 

    let button = $(`<button class="animated-roll-btn">🎰 Animate Roll</button>`);
    button.on("click", () => {
        console.log("Animate Roll button clicked!");
        window.startAnimatedRoll(app.object); // Use global function
    });

    footer.append(button);
});


console.log("main.js has loaded");