document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    const scrollThreshold = 50; // Number of pixels to scroll before shrinking navbar

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > scrollThreshold) {
            navbar.classList.add('small');
        } else {
            navbar.classList.remove('small');
        }
        
        lastScrollTop = scrollTop;
    });
}); 