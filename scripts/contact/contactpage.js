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
