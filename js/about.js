// About page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Load navigation and footer components
    loadComponent('components/navigation.html', 'navigation-container');
    loadComponent('components/footer.html', 'footer-container');
    
    // Initialize any about page specific functionality
    initAboutPage();
});

// Initialize about page specific functionality
function initAboutPage() {
    // Add any animations or interactive elements specific to the about page
    initTimelineAnimation();
    initTeamCards();
}

// Initialize timeline animation
function initTimelineAnimation() {
    const timelineItems = document.querySelectorAll('.space-y-12 > div');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });
}

// Initialize team cards hover effects
function initTeamCards() {
    const teamCards = document.querySelectorAll('.space-y-12 > div');
    
    teamCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}
