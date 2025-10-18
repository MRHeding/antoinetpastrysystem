// Contact page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Load navigation and footer components
    loadComponent('components/navigation.html', 'navigation-container');
    loadComponent('components/footer.html', 'footer-container');
    
    // Initialize contact form
    initContactForm();
    
    // Initialize FAQ accordion
    initFAQ();
});

// Initialize contact form
function initContactForm() {
    const form = document.getElementById('contact-form');
    
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        
        // Add real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Validate form
    if (!validateForm(form)) {
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
    submitButton.disabled = true;
    
    try {
        // In a real application, you would send this to your backend
        // For now, we'll simulate a successful submission
        await simulateFormSubmission(formData);
        
        showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
        form.reset();
        
    } catch (error) {
        console.error('Form submission error:', error);
        showNotification('Sorry, there was an error sending your message. Please try again.', 'error');
    } finally {
        // Reset button state
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// Simulate form submission (replace with actual API call)
function simulateFormSubmission(formData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate success
            resolve({ success: true });
        }, 2000);
    });
}

// Validate entire form
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Validate individual field
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldName = field.name;
    
    // Clear previous error
    clearFieldError(e);
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    
    // Phone validation
    if (fieldName === 'phone' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
    }
    
    return true;
}

// Show field error
function showFieldError(field, message) {
    field.classList.add('border-red-500', 'focus:ring-red-500');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message text-red-500 text-sm mt-1';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('border-red-500', 'focus:ring-red-500');
    field.classList.add('border-gray-300', 'focus:ring-amber-500');
    
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Initialize FAQ section
function initFAQ() {
    const faqItems = document.querySelectorAll('.space-y-6 > div');
    
    faqItems.forEach(item => {
        const question = item.querySelector('h3');
        const answer = item.querySelector('p');
        
        if (question && answer) {
            // Add click handler to toggle answer visibility
            question.style.cursor = 'pointer';
            question.addEventListener('click', function() {
                toggleFAQItem(item, answer);
            });
            
            // Add visual indicator
            const icon = document.createElement('i');
            icon.className = 'fas fa-chevron-down text-amber-600 ml-2 transition-transform duration-200';
            question.appendChild(icon);
            
            // Initially hide answers
            answer.style.display = 'none';
        }
    });
}

// Toggle FAQ item
function toggleFAQItem(item, answer) {
    const icon = item.querySelector('h3 i');
    const isVisible = answer.style.display !== 'none';
    
    if (isVisible) {
        answer.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
        item.classList.remove('bg-amber-50');
    } else {
        answer.style.display = 'block';
        icon.style.transform = 'rotate(180deg)';
        item.classList.add('bg-amber-50');
    }
}
