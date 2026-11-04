
/* =========================================
   SHAYAAN MECHANIC — V2 JAVASCRIPT
   Navigation / GSAP / Canvas / Enquiry
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       01. CONFIGURATION
    ===================================== */

    const CONFIG = {
        frameCount: 243,
        framePath: "assets/optimized-frames/",
        framePrefix: "frame-",
        frameExtension: ".webp",

        initialFrames: 12,
        prefetchRadius: 5,
        maxCacheSize: 55,

        // Replace with the mechanic's verified WhatsApp number.
        // Use country code + number, without + or spaces.
        whatsappNumber: "91YOURNUMBER"
    };


    /* =====================================
       02. DOM ELEMENTS
    ===================================== */

    const navbar = document.getElementById("navbar");
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");

    const hero = document.querySelector(".hero");
    const canvas = document.getElementById("heroCanvas");
    const fallbackImage = document.getElementById("fallbackImage");
    const heroLoader = document.getElementById("heroLoader");
    const loaderProgress = document.getElementById("loaderProgress");
    const frameCounter = document.getElementById("frameCounter");

    const comparisonContainer =
        document.getElementById("comparisonContainer");

    const comparisonBefore =
        document.querySelector(".comparison-before");

    const comparisonDivider =
        document.getElementById("comparisonDivider");

    const comparisonRange =
        document.getElementById("comparisonRange");

    const enquiryModal =
        document.getElementById("enquiryModal");

    const modalClose =
        document.getElementById("modalClose");

    const enquiryForm =
        document.getElementById("enquiryForm");


    /* =====================================
       03. MOBILE NAVIGATION
    ===================================== */

    function openMenu() {
        navMenu?.classList.add("active");
        menuToggle?.classList.add("active");

        menuToggle?.setAttribute("aria-expanded", "true");
        document.body.classList.add("menu-open");
    }

    function closeMenu() {
        navMenu?.classList.remove("active");
        menuToggle?.classList.remove("active");

        menuToggle?.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
    }

    menuToggle?.addEventListener("click", () => {

        const isOpen = navMenu.classList.contains("active");

        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }

    });

    // Close menu when a navigation link is clicked.
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    // Close menu with Escape.
    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeMenu();
            closeEnquiryModal();
        }

    });

    // Close menu when clicking outside it.
    document.addEventListener("click", event => {

        if (
            navMenu?.classList.contains("active") &&
            !navMenu.contains(event.target) &&
            !menuToggle?.contains(event.target)
        ) {
            closeMenu();
        }

    });


    /* =====================================
       04. NAVBAR SCROLL EFFECT
    ===================================== */

    function updateNavbar() {

        if (!navbar) return;

        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

    }

    window.addEventListener("scroll", updateNavbar, {
        passive: true
    });

    updateNavbar();


    /* =====================================
       05. BEFORE / AFTER SLIDER
    ===================================== */

    function updateComparison(value) {

        if (
            !comparisonBefore ||
            !comparisonDivider
        ) return;

        comparisonBefore.style.width = `${value}%`;
        comparisonDivider.style.left = `${value}%`;

    }

    if (comparisonRange) {

        comparisonRange.addEventListener("input", event => {
            updateComparison(event.target.value);
        });

        updateComparison(comparisonRange.value);

    }

    // Optional mouse and touch interaction through the slider input
    // is already handled by the native range control.


    /* =====================================
       06. ENQUIRY MODAL
    ===================================== */

    function openEnquiryModal() {

        if (!enquiryModal) return;

        closeMenu();

        enquiryModal.classList.add("active");
        enquiryModal.setAttribute("aria-hidden", "false");

        document.body.classList.add("modal-open");

        const firstInput =
            document.getElementById("customerName");

        setTimeout(() => {
            firstInput?.focus();
        }, 200);

    }

    function closeEnquiryModal() {

        if (!enquiryModal) return;

        enquiryModal.classList.remove("active");
        enquiryModal.setAttribute("aria-hidden", "true");

        document.body.classList.remove("modal-open");

    }

    // Open buttons.
    document.querySelectorAll("[data-open-enquiry]").forEach(button => {
        button.addEventListener("click", openEnquiryModal);
    });

    // Close button.
    modalClose?.addEventListener("click", closeEnquiryModal);

    // Close using backdrop.
    document.querySelectorAll("[data-close-enquiry]").forEach(element => {
        element.addEventListener("click", closeEnquiryModal);
    });


    /* =====================================
       07. WHATSAPP ENQUIRY FORM
    ===================================== */

    enquiryForm?.addEventListener("submit", event => {

        event.preventDefault();

        const name =
            document.getElementById("customerName").value.trim();

        const phone =
            document.getElementById("customerPhone").value.trim();

        const bike =
            document.getElementById("bikeModel").value;

        const message =
            document.getElementById("buildMessage").value.trim();

        // Basic validation.
        if (!name || !phone || !bike || !message) {

            alert("Please complete all the enquiry fields.");

            return;

        }

        if (!/^[0-9+\-\s()]{8,20}$/.test(phone)) {

            alert("Please enter a valid phone number.");

            return;

        }

        // Check whether the business WhatsApp number is configured.
        if (
            !CONFIG.whatsappNumber ||
            CONFIG.whatsappNumber.includes("YOURNUMBER")
        ) {

            alert(
                "WhatsApp number is not configured yet. " +
                "Please add the mechanic's verified number in script.js."
            );

            return;

        }

        const whatsappMessage = `
Hello Shayaan Mechanic,

I would like to discuss a motorcycle modification.

Name: ${name}

Phone: ${phone}

Motorcycle: ${bike}

Build Idea:
${message}

I would like to know more about the customisation process.

Thank you.
        `.trim();

        const whatsappURL =
            `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

        window.open(
            whatsappURL,
            "_blank",
            "noopener,noreferrer"
        );

        closeEnquiryModal();

    });


    /* =====================================
       08. GSAP INITIALIZATION
    ===================================== */

    const gsapAvailable =
        typeof gsap !== "undefined" &&
        typeof ScrollTrigger !== "undefined";

    if (gsapAvailable) {

        gsap.registerPlugin(ScrollTrigger);

    } else {

        console.warn(
            "GSAP or ScrollTrigger was not loaded. " +
            "Scroll animations will be disabled."
        );

    }


    /* =====================================
       09. HERO CANVAS SETUP
    ===================================== */

    if (!canvas || !hero) return;

    const context = canvas.getContext("2d", {
        alpha: false
    });

    if (!context) return;

    let currentFrame = 1;
    let canvasReady = false;
    let resizeTimer;

    const frameCache = new Map();
    const pendingFrames = new Map();
    const frameQueue = [];

    let activeLoads = 0;

    const MAX_CONCURRENT_LOADS = 6;


    /* =====================================
       10. FRAME UTILITIES
    ===================================== */

    function getFramePath(frameNumber) {

        const paddedNumber =
            String(frameNumber).padStart(4, "0");

        return (
            CONFIG.framePath +
            CONFIG.framePrefix +
            paddedNumber +
            CONFIG.frameExtension
        );

    }

    function updateFrameCounter(frameNumber) {

        if (!frameCounter) return;

        const current =
            String(frameNumber).padStart(3, "0");

        const total =
            String(CONFIG.frameCount).padStart(3, "0");

        frameCounter.textContent =
            `${current} / ${total}`;

    }


    /* =====================================
       11. CANVAS RESIZE
    ===================================== */

    function resizeCanvas() {

        const rect = canvas.getBoundingClientRect();

        const pixelRatio = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        canvas.width = Math.round(rect.width * pixelRatio);
        canvas.height = Math.round(rect.height * pixelRatio);

        context.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );

        drawFrame(currentFrame);

    }


    /* =====================================
       12. DRAW FRAME ON CANVAS
    ===================================== */

    function drawFrame(frameNumber) {

        const image = frameCache.get(frameNumber);

        if (!image || !image.complete) return;

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        if (!width || !height) return;

        const imageWidth = image.naturalWidth;
        const imageHeight = image.naturalHeight;

        if (!imageWidth || !imageHeight) return;

        const isMobile = window.innerWidth <= 760;

        const scale = isMobile
            ? Math.min(
                width / imageWidth,
                height / imageHeight
            )
            : Math.max(
                width / imageWidth,
                height / imageHeight
            );

        const drawWidth = imageWidth * scale;
        const drawHeight = imageHeight * scale;

        const x = (width - drawWidth) / 2;
        const y = (height - drawHeight) / 2;

        context.clearRect(0, 0, width, height);

        context.fillStyle = "#b9a18a";
        context.fillRect(0, 0, width, height);

        context.drawImage(
            image,
            x,
            y,
            drawWidth,
            drawHeight
        );

        if (!canvasReady) {

            canvasReady = true;

            canvas.style.opacity = "1";

            if (fallbackImage) {
                fallbackImage.style.opacity = "0";
            }

            if (heroLoader) {
                heroLoader.style.display = "none";
            }

        }

        updateFrameCounter(frameNumber);

    }


    /* =====================================
       13. FRAME CACHE MANAGEMENT
    ===================================== */

    function trimFrameCache() {

        if (frameCache.size <= CONFIG.maxCacheSize) return;

        const frames = [...frameCache.keys()];

        frames.sort((a, b) => {

            const distanceA = Math.abs(a - currentFrame);
            const distanceB = Math.abs(b - currentFrame);

            return distanceB - distanceA;

        });

        while (
            frameCache.size > CONFIG.maxCacheSize &&
            frames.length > 0
        ) {

            const frameToRemove = frames.shift();

            // Keep the frame currently being displayed.
            if (frameToRemove === currentFrame) continue;

            frameCache.delete(frameToRemove);

        }

    }


    /* =====================================
       14. IMPROVED FRAME LOADING QUEUE
    ===================================== */

    // Lower priority number = loaded sooner.
    // Frame currently needed = priority 0.

    function sortFrameQueue() {

        frameQueue.sort((a, b) => {
            return a.priority - b.priority;
        });

    }

    function loadFrame(frameNumber, priority = 10) {

        if (
            frameNumber < 1 ||
            frameNumber > CONFIG.frameCount
        ) {
            return Promise.resolve(null);
        }

        if (frameCache.has(frameNumber)) {

            return Promise.resolve(
                frameCache.get(frameNumber)
            );

        }

        // If this frame is already loading or queued,
        // update its priority instead of requesting it again.
        if (pendingFrames.has(frameNumber)) {

            const existingTask = pendingFrames.get(frameNumber);

            if (priority < existingTask.priority) {

                existingTask.priority = priority;

                sortFrameQueue();

            }

            return existingTask.promise;

        }

        let resolvePromise;

        const promise = new Promise(resolve => {
            resolvePromise = resolve;
        });

        const task = {
            frameNumber,
            priority,
            resolve: resolvePromise,
            promise
        };

        // Store the task BEFORE processing the queue.
        // This prevents duplicate requests caused by a race condition.
        pendingFrames.set(frameNumber, task);

        frameQueue.push(task);

        sortFrameQueue();

        processFrameQueue();

        return promise;

    }


    function processFrameQueue() {

        while (
            activeLoads < MAX_CONCURRENT_LOADS &&
            frameQueue.length > 0
        ) {

            sortFrameQueue();

            const task = frameQueue.shift();

            // Skip tasks that are no longer registered.
            if (pendingFrames.get(task.frameNumber) !== task) {
                continue;
            }

            activeLoads++;

            const image = new Image();

            image.decoding = "async";

            image.onload = () => {

                frameCache.set(task.frameNumber, image);

                pendingFrames.delete(task.frameNumber);

                activeLoads--;

                trimFrameCache();

                task.resolve(image);

                if (task.frameNumber === currentFrame) {
                    drawFrame(currentFrame);
                }

                processFrameQueue();

            };

            image.onerror = () => {

                console.warn(
                    `Could not load frame ${task.frameNumber}:`,
                    getFramePath(task.frameNumber)
                );

                pendingFrames.delete(task.frameNumber);

                activeLoads--;

                task.resolve(null);

                processFrameQueue();

            };

            image.src = getFramePath(task.frameNumber);

        }

    }


    // Remove queued prefetch requests that are too far
    // from the current frame. Already-running requests finish normally.

    function removeOutdatedQueuedFrames(frameNumber) {

        for (let i = frameQueue.length - 1; i >= 0; i--) {

            const task = frameQueue[i];

            const distance = Math.abs(
                task.frameNumber - frameNumber
            );

            if (
                distance > CONFIG.prefetchRadius + 2 &&
                task.frameNumber !== frameNumber
            ) {

                frameQueue.splice(i, 1);

                pendingFrames.delete(task.frameNumber);

                task.resolve(null);

            }

        }

    }


    /* =====================================
       15. LOAD INITIAL FRAMES
    ===================================== */

    async function loadInitialFrames() {

        let loadedCount = 0;

        const initialPromises = [];

        for (
            let frame = 1;
            frame <= CONFIG.initialFrames;
            frame++
        ) {

            initialPromises.push(

                // Load the first frame before the others.
                loadFrame(frame, frame === 1 ? 0 : frame).then(image => {

                    if (image) {
                        loadedCount++;
                    }

                    const progress = Math.round(
                        (loadedCount / CONFIG.initialFrames) * 100
                    );

                    if (loaderProgress) {
                        loaderProgress.textContent =
                            `${progress}%`;
                    }

                    if (frame === 1 && image) {
                        drawFrame(1);
                    }

                })

            );

        }

        await Promise.all(initialPromises);

        // Start requesting nearby frames.
        preloadNearbyFrames(1);

    }


    /* =====================================
       16. IMPROVED PROGRESSIVE PREFETCHING
    ===================================== */

    let previousFrame = 1;

    function preloadNearbyFrames(frameNumber) {

        // Detect scroll direction from frame movement.
        const direction =
            frameNumber >= previousFrame ? 1 : -1;

        previousFrame = frameNumber;

        // Remove old queued requests before adding new ones.
        removeOutdatedQueuedFrames(frameNumber);

        // Prioritize frames in the current scroll direction.
        for (
            let distance = 1;
            distance <= CONFIG.prefetchRadius;
            distance++
        ) {

            const nextFrame =
                frameNumber + (distance * direction);

            const oppositeFrame =
                frameNumber - (distance * direction);

            if (
                nextFrame >= 1 &&
                nextFrame <= CONFIG.frameCount
            ) {

                loadFrame(nextFrame, distance);

            }

            if (
                oppositeFrame >= 1 &&
                oppositeFrame <= CONFIG.frameCount
            ) {

                loadFrame(oppositeFrame, distance + 10);

            }

        }

        sortFrameQueue();

        processFrameQueue();

    }


    /* =====================================
       17. CHANGE HERO FRAME
    ===================================== */

    function showFrame(frameNumber) {

        const safeFrame = Math.max(
            1,
            Math.min(
                CONFIG.frameCount,
                Math.round(frameNumber)
            )
        );

        currentFrame = safeFrame;

        updateFrameCounter(safeFrame);

        if (frameCache.has(safeFrame)) {

            drawFrame(safeFrame);

        } else {

            // The currently required frame always receives
            // the highest loading priority.
            loadFrame(safeFrame, 0).then(image => {

                if (
                    image &&
                    safeFrame === currentFrame
                ) {
                    drawFrame(safeFrame);
                }

            });

        }

        // Continue loading frames around the current position.
        preloadNearbyFrames(safeFrame);

    }


    /* =====================================
       18. GSAP SCROLL-DRIVEN HERO
    ===================================== */

    function initializeHeroAnimation() {

        if (!gsapAvailable) return;

        const playhead = {
            frame: 1
        };

        gsap.to(playhead, {

            frame: CONFIG.frameCount,

            ease: "none",

            snap: "frame",

            onUpdate: () => {

                showFrame(playhead.frame);

            },

            scrollTrigger: {

                trigger: hero,

                start: "top top",

                end: () => {
                    const scrollLength =
                        window.innerWidth <= 760 ? 1.5 : 2.5;

                    return `+=${window.innerHeight * scrollLength}`;
                },

                scrub: 0.4,

                pin: true,

                anticipatePin: 1,

                invalidateOnRefresh: true

            }

        });

        ScrollTrigger.refresh();

    }


    /* =====================================
       19. HERO INITIALIZATION
    ===================================== */

    async function initializeHero() {

        resizeCanvas();

        await loadInitialFrames();

        initializeHeroAnimation();

    }

    initializeHero();


    /* =====================================
       20. WINDOW RESIZE
    ===================================== */

    window.addEventListener("resize", () => {

        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {

            resizeCanvas();

            if (gsapAvailable) {
                ScrollTrigger.refresh();
            }

        }, 200);

    });


    /* =====================================
       21. INITIAL CANVAS STATE
    ===================================== */

    canvas.style.opacity = "0";

    canvas.style.transition = "opacity 0.5s ease";

    updateFrameCounter(1);


    /* =====================================
       22. FINAL INITIALIZATION
    ===================================== */

    console.log(
        "Shayaan Mechanic V2 initialized successfully."
    );

});
