const welcomeText = document.getElementById("welcome-text");
const commandContainer = document.getElementById("command-container");
const userCommand = document.getElementById("user-command");
const terminalInput = document.getElementById("terminal-input");
const welcomeMessage = "Welcome to my website!";
let typedCommand = "";
let welcomeIndex = 0;

const typeWelcomeMessage = () => {
    if (!welcomeText || welcomeIndex >= welcomeMessage.length) {
        userCommand?.classList.add("is-visible");
        userCommand?.focus();
        return;
    }

    welcomeText.textContent += welcomeMessage[welcomeIndex];
    welcomeIndex += 1;
    setTimeout(typeWelcomeMessage, 85);
};

const renderTypedCommand = () => {
    terminalInput.textContent = typedCommand;
};

const isEditableElement = (element) => {
    return element instanceof HTMLInputElement
        || element instanceof HTMLTextAreaElement
        || element?.isContentEditable;
};

const handleTerminalTyping = (event) => {
    if (
        !terminalInput
        || !userCommand?.classList.contains("is-visible")
        || isEditableElement(event.target)
    ) {
        return;
    }

    if (event.key === "Backspace") {
        event.preventDefault();
        typedCommand = typedCommand.slice(0, -1);
        renderTypedCommand();
        return;
    }

    if (event.key === "Enter") {
        event.preventDefault();
        typedCommand = "";
        renderTypedCommand();
        return;
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        typedCommand += event.key;
        renderTypedCommand();
    }
};

userCommand?.addEventListener("click", () => {
    userCommand.focus();
});

commandContainer?.addEventListener("click", () => {
    userCommand?.focus();
});

document.addEventListener("keydown", handleTerminalTyping);
typeWelcomeMessage();
