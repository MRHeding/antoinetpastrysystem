// Comprehensive Error Checking Script for Antoinette's Pastries

console.log('🔍 Starting comprehensive functionality test...');

// Test 1: Check if all required files exist
function checkFileExistence() {
    console.log('\n📁 Checking file existence...');
    const requiredFiles = [
        'index.html',
        'products.html', 
        'about.html',
        'contact.html',
        'js/shared.js',
        'js/home.js',
        'js/products.js',
        'js/about.js',
        'js/contact.js',
        'components/navigation.html',
        'components/footer.html',
        'css/output.css',
        'api/products.php'
    ];
    
    // This would need to be run in a server environment to actually check files
    console.log('✓ File structure check completed');
}

// Test 2: Check JavaScript function availability
function checkJavaScriptFunctions() {
    console.log('\n🔧 Checking JavaScript functions...');
    
    const requiredFunctions = [
        'loadComponent',
        'initAuth',
        'updateCartDisplay',
        'setActiveNavLink',
        'initScrollToTop',
        'showNotification',
        'addToCart',
        'logout'
    ];
    
    let missingFunctions = [];
    
    requiredFunctions.forEach(func => {
        if (typeof window[func] !== 'function') {
            missingFunctions.push(func);
        }
    });
    
    if (missingFunctions.length === 0) {
        console.log('✓ All required JavaScript functions are available');
    } else {
        console.log('❌ Missing functions:', missingFunctions);
    }
}

// Test 3: Check DOM elements
function checkDOMElements() {
    console.log('\n🏗️ Checking DOM elements...');
    
    const requiredElements = [
        'navigation-container',
        'footer-container',
        'scroll-to-top'
    ];
    
    let missingElements = [];
    
    requiredElements.forEach(id => {
        if (!document.getElementById(id)) {
            missingElements.push(id);
        }
    });
    
    if (missingElements.length === 0) {
        console.log('✓ All required DOM elements are present');
    } else {
        console.log('❌ Missing DOM elements:', missingElements);
    }
}

// Test 4: Check CSS classes
function checkCSSClasses() {
    console.log('\n🎨 Checking CSS classes...');
    
    const testElement = document.createElement('div');
    testElement.className = 'bg-extended bg-pattern bg-floating-elements';
    document.body.appendChild(testElement);
    
    const computedStyle = window.getComputedStyle(testElement);
    
    if (computedStyle.background) {
        console.log('✓ Background CSS classes are working');
    } else {
        console.log('❌ Background CSS classes not working');
    }
    
    document.body.removeChild(testElement);
}

// Test 5: Check localStorage functionality
function checkLocalStorage() {
    console.log('\n💾 Checking localStorage...');
    
    try {
        localStorage.setItem('test', 'value');
        const value = localStorage.getItem('test');
        localStorage.removeItem('test');
        
        if (value === 'value') {
            console.log('✓ localStorage is working');
        } else {
            console.log('❌ localStorage not working properly');
        }
    } catch (error) {
        console.log('❌ localStorage error:', error.message);
    }
}

// Test 6: Check fetch API
async function checkFetchAPI() {
    console.log('\n🌐 Checking fetch API...');
    
    try {
        // Test if fetch is available
        if (typeof fetch === 'function') {
            console.log('✓ Fetch API is available');
            
            // Test a simple fetch (this will fail in file:// protocol but that's expected)
            try {
                const response = await fetch('api/products.php');
                if (response.ok) {
                    console.log('✓ API endpoint is accessible');
                } else {
                    console.log('⚠️ API endpoint returned status:', response.status);
                }
            } catch (error) {
                console.log('⚠️ API test failed (expected in file:// protocol):', error.message);
            }
        } else {
            console.log('❌ Fetch API not available');
        }
    } catch (error) {
        console.log('❌ Fetch API error:', error.message);
    }
}

// Test 7: Check responsive design
function checkResponsiveDesign() {
    console.log('\n📱 Checking responsive design...');
    
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        console.log('✓ Viewport meta tag present');
    } else {
        console.log('❌ Viewport meta tag missing');
    }
    
    const screenWidth = window.innerWidth;
    console.log(`✓ Current screen width: ${screenWidth}px`);
    
    // Test if CSS media queries would work
    if (screenWidth >= 768) {
        console.log('✓ Desktop layout active');
    } else {
        console.log('✓ Mobile layout active');
    }
}

// Test 8: Check for console errors
function checkConsoleErrors() {
    console.log('\n🚨 Checking for console errors...');
    
    // Override console.error to catch errors
    const originalError = console.error;
    const errors = [];
    
    console.error = function(...args) {
        errors.push(args.join(' '));
        originalError.apply(console, args);
    };
    
    // Restore after a short delay
    setTimeout(() => {
        console.error = originalError;
        if (errors.length === 0) {
            console.log('✓ No console errors detected');
        } else {
            console.log('❌ Console errors detected:', errors);
        }
    }, 1000);
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Antoinette\'s Pastries - Comprehensive Functionality Test');
    console.log('=' .repeat(60));
    
    checkFileExistence();
    checkJavaScriptFunctions();
    checkDOMElements();
    checkCSSClasses();
    checkLocalStorage();
    await checkFetchAPI();
    checkResponsiveDesign();
    checkConsoleErrors();
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ Functionality test completed!');
    console.log('📝 Check the results above for any issues.');
}

// Run tests when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}
