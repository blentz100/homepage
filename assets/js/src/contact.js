import "vanilla-hcaptcha";
import fetch from "cross-fetch";

// don't continue if there isn't a contact form on this page
// TODO: be better and only do any of this on /contact/
const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    // immediately prevent <form> from actually submitting to a new page
    event.preventDefault();

    const submitButton = document.getElementById("contact-form-btn-submit");

    // disable the whole form if the button has been disabled below (on success)
    if (submitButton.disabled === true) {
      return;
    }

    // change button appearance between click and server response
    submitButton.innerText = "Sending...";
    submitButton.disabled = true; // prevent accidental multiple submissions
    submitButton.style.cursor = "default";

    // feedback <span>s for later
    const successSpan = document.getElementById("contact-form-result-success");
    const errorSpan = document.getElementById("contact-form-result-error");

    // https://simonplend.com/how-to-use-fetch-to-post-form-data-as-json-to-your-api/
    const formData = Object.fromEntries(new FormData(event.currentTarget).entries());

    fetch(contactForm.action, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success === true) {
          // handle successful submission
          // we can disable submissions & hide the send button now
          submitButton.disabled = true;
          submitButton.style.display = "none";

          // just in case there *was* a PEBCAK error and it was corrected
          errorSpan.style.display = "none";

          // let user know we were successful
          successSpan.innerText = "Success! You should hear from me soon. :)";
        } else {
          // pass on an error sent by the server
          throw new Error(data.message);
        }
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Unknown";

        // give user feedback based on the error message returned
        if (message === "invalidCaptcha") {
          errorSpan.innerText = "Error: Did you remember to click the CAPTCHA?";
        } else if (message === "invalidEmail") {
          errorSpan.innerText = "Error: Please double check your email address.";
        } else if (message === "missingData") {
          errorSpan.innerText = "Error: Please make sure that all fields are filled in.";
        } else {
          // something else went wrong, and it's probably my fault...
          errorSpan.innerText = "Internal server error. Try again later?";
        }

        // reset submit button to let user try again
        submitButton.innerText = "Try Again";
        submitButton.disabled = false;
        submitButton.style.cursor = "pointer";
      });
  });
}
