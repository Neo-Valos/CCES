document.addEventListener('DOMContentLoaded', function() {
    // Preloader
    const preloader = document.querySelector('.preloader');

    window.addEventListener('load', function() {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    });

    // Header scroll effect
    const header = document.querySelector('.header');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav ul');

    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
        this.querySelector('i').classList.toggle('fa-times');
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                if (nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    menuToggle.querySelector('i').classList.remove('fa-times');
                }
            }
        });
    });

    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // YouTube API Integration
    const API_KEY = 'AIzaSyBDZ3glKpf87-XMa2r9Vff3z1xz6P1P2qw';
    const CHANNEL_ID = 'UCUC5hkKYzzIP7EXQzB44PkQ';
    const featuredVideoIframe = document.getElementById('featured-video-iframe');
    const videoTitle = document.getElementById('video-title');
    const videoDate = document.getElementById('video-date');
    const videoDescription = document.getElementById('video-description');
    const videoGallery = document.getElementById('video-gallery');
    const modal = document.querySelector('.video-modal');
    const modalVideo = document.getElementById('modal-video');
    const modalVideoTitle = document.getElementById('modal-video-title');
    const modalVideoDate = document.getElementById('modal-video-date');
    const modalVideoDescription = document.getElementById('modal-video-description');
    const closeModal = document.querySelector('.close-modal');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Fetch latest video for featured section
    async function fetchLatestVideo() {
        try {
            const response = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=1`);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                const video = data.items[0];
                featuredVideoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}`;
                videoTitle.textContent = video.snippet.title;
                videoDate.textContent = new Date(video.snippet.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                videoDescription.textContent = video.snippet.description;
            }
        } catch (error) {
            console.error('Error fetching latest video:', error);
            videoTitle.textContent = 'Failed to load latest sermon. Please try again later.';
        }
    }

    // Fetch videos for gallery
    async function fetchVideos() {
        try {
            const response = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=12`);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                videoGallery.innerHTML = '';

                data.items.forEach((video, index) => {
                    // Simulate categories for demo (in real app, you might get this from video tags)
                    const categories = ['sermon', 'bible-study', 'special'];
                    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

                    const videoCard = document.createElement('div');
                    videoCard.className = `video-card fade-in delay-${Math.floor(index / 3)}`;
                    videoCard.setAttribute('data-category', randomCategory);

                    videoCard.innerHTML = `
                        <div class="video-thumbnail">
                            <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
                            <div class="play-button">
                                <i class="fas fa-play"></i>
                            </div>
                            <span class="video-duration">25:30</span>
                            <span class="video-category">${randomCategory.replace('-', ' ')}</span>
                        </div>
                        <div class="video-card-content">
                            <h3>${video.snippet.title}</h3>
                            <div class="video-card-meta">
                                <span>${new Date(video.snippet.publishedAt).toLocaleDateString()}</span>
                                <span><i class="fas fa-eye"></i> 1.2K</span>
                            </div>
                        </div>
                    `;

                    videoCard.addEventListener('click', () => {
                        openModal(video);
                    });

                    videoGallery.appendChild(videoCard);
                });
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
            videoGallery.innerHTML = '<div class="error-message">Failed to load videos. Please try again later.</div>';
        }
    }

    // Open video modal
    function openModal(video) {
        modalVideo.src = `https://www.youtube.com/embed/${video.id.videoId}`;
        modalVideoTitle.textContent = video.snippet.title;
        modalVideoDate.textContent = new Date(video.snippet.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        modalVideoDescription.textContent = video.snippet.description;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close video modal
    function closeVideoModal() {
        modalVideo.src = '';
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Filter videos by category
    function filterVideos(category) {
        const videoCards = document.querySelectorAll('.video-card');

        videoCards.forEach(card => {
            if (category === 'all' || card.getAttribute('data-category') === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Event listeners
    closeModal.addEventListener('click', closeVideoModal);
    modal.querySelector('.modal-overlay').addEventListener('click', closeVideoModal);

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            filterVideos(this.getAttribute('data-filter'));
        });
    });

    // Initialize
    fetchLatestVideo();
    fetchVideos();

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section-header, .video-card').forEach(element => {
        observer.observe(element);
    });
});