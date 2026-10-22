const renderContactPage = () => `
    <section id="contact-page" aria-labelledby="contact-title">
        <header class="contact-intro">
            <h2 id="contact-title">Contact</h2>
            <p>Contact me using the form below or via email.</p>
        </header>

        <form id="contact-form" aria-describedby="contact-form-note">
            <div class="contact-fields-row">
                <div class="contact-field">
                    <label for="contact-name">Name</label>
                    <input id="contact-name" name="name" type="text" autocomplete="name" maxlength="100" required>
                </div>
                <div class="contact-field">
                    <label for="contact-email">Email</label>
                    <input id="contact-email" name="email" type="email" autocomplete="email" maxlength="254" required>
                </div>
            </div>

            <div class="contact-field">
                <label for="contact-subject">Subject <span>(optional)</span></label>
                <input id="contact-subject" name="subject" type="text" maxlength="160">
            </div>

            <div class="contact-field">
                <label for="contact-message">Message</label>
                <textarea id="contact-message" name="message" rows="7" maxlength="5000" required></textarea>
            </div>

            <div class="contact-actions">
                <p id="contact-form-note">This form isn't accepting messages yet. You can email me below.</p>
                <button type="submit">Send message <span aria-hidden="true">&rarr;</span></button>
            </div>
            <p id="contact-status" role="status" aria-live="polite" hidden></p>
        </form>

        <p class="contact-direct">Prefer email? <a href="mailto:ben.jury@benjury.dev">ben.jury@benjury.dev</a></p>
    </section>
`;

const setupContactPage = () => {
    const form = document.getElementById("contact-form");
    if (!form) return null;

    const status = document.getElementById("contact-status");
    const requiredTextFields = [form.elements.name, form.elements.message];

    const validateText = () => {
        requiredTextFields.forEach((field) => {
            field.setCustomValidity(field.value.trim() ? "" : "Please fill out this field.");
        });
        status.hidden = true;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        validateText();
        if (!form.reportValidity()) return;

        // Connect the backend here. No request is sent and the draft stays in the form.
        status.textContent = "Your message hasn't been sent. Please email ben.jury@benjury.dev while the form is unavailable.";
        status.hidden = false;
    };

    form.addEventListener("input", validateText);
    form.addEventListener("submit", handleSubmit);

    return () => {
        form.removeEventListener("input", validateText);
        form.removeEventListener("submit", handleSubmit);
    };
};
