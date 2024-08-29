document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorMessages = document.getElementById('errorMessages');
  const successMessage = document.getElementById('successMessage');

  form.addEventListener('submit', async (event) => {
    // Prevent default form submission
    event.preventDefault();

    // Clear previous messages
    errorMessages.innerHTML = '';
    errorMessages.classList.add('d-none');
    successMessage.innerHTML = '';
    successMessage.classList.add('d-none');

    // Get form values
    const email = form.querySelector('#email').value.trim();
    const password = form.querySelector('#password').value.trim();

    // Validate form data
    const errors = [];

    if (!email) {
      errors.push('Email address is required.');
    } else if (!validateEmail(email)) {
      errors.push('Invalid email address.');
    }

    if (!password) {
      errors.push('Password is required.');
    }

    // If there are errors, show them and return
    if (errors.length > 0) {
      errorMessages.innerHTML = errors.join('<br>');
      errorMessages.classList.remove('d-none');
      return;
    }

    // Submit the form data using fetch
    try {
      const response = await fetch('user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (response.ok) {
        // Display success message and/or redirect
        successMessage.innerHTML = 'Login successful! Redirecting...';
        successMessage.classList.remove('d-none');

        setTimeout(() => {
          window.location.href = '/blogs'; // Change to your dashboard or desired page
        }, 1000);
      } else {
        // Display server-side validation errors
        errorMessages.innerHTML = result.error || 'An error occurred. Please try again.';
        errorMessages.classList.remove('d-none');
      }
    } catch (error) {
      console.error('Error:', error);
      errorMessages.innerHTML = 'An error occurred. Please try again.';
      errorMessages.classList.remove('d-none');
    }
  });

  // Function to validate email format
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
});
